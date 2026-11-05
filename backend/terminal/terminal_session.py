import os
import sys
import shlex
import subprocess
import glob
import time
from services.workspace_service import WorkspaceService
from execution.pig.pig_engine import PigEngine
from execution.mapreduce.mr_framework import MapReduceRunner

class TerminalSession:
    def __init__(self, session_id, user_id=1):
        self.session_id = session_id
        self.user_id = user_id
        self.workspace_dir = WorkspaceService.get_workspace_dir(user_id)
        self.cwd = self.workspace_dir
        self.history = []
        self.env = os.environ.copy()
        self.env['USER'] = f'student{user_id}'
        self.env['HOME'] = self.workspace_dir

    def get_prompt(self):
        rel_dir = os.path.relpath(self.cwd, self.workspace_dir).replace('\\', '/')
        display_path = "~" if rel_dir == "." else f"~/{rel_dir}"
        return f"\033[1;32mstudent@bigdata-lab\033[0m:\033[1;34m{display_path}\033[0m$ "

    def execute_command(self, raw_cmd):
        cmd_str = raw_cmd.strip()
        if not cmd_str:
            return {'output': '', 'prompt': self.get_prompt(), 'cwd': self.cwd}

        self.history.append(cmd_str)
        tokens = shlex.split(cmd_str, posix=False) if os.name == 'nt' else shlex.split(cmd_str)
        if not tokens:
            return {'output': '', 'prompt': self.get_prompt(), 'cwd': self.cwd}

        base_cmd = tokens[0].lower()

        # Built-in handlers for terminal parity
        if base_cmd in ('clear', 'cls'):
            return {'output': '\033[2J\033[H', 'prompt': self.get_prompt(), 'cwd': self.cwd}

        if base_cmd == 'pwd':
            rel_dir = os.path.relpath(self.cwd, self.workspace_dir).replace('\\', '/')
            display_path = "/home/student" if rel_dir == "." else f"/home/student/{rel_dir}"
            return {'output': display_path + "\n", 'prompt': self.get_prompt(), 'cwd': self.cwd}

        if base_cmd == 'cd':
            target = tokens[1] if len(tokens) > 1 else self.workspace_dir
            if target == '~':
                self.cwd = self.workspace_dir
            else:
                new_path = os.path.abspath(os.path.join(self.cwd, target))
                if not new_path.startswith(self.workspace_dir):
                    return {'output': "bash: cd: permission denied (confined to user workspace)\n", 'prompt': self.get_prompt(), 'cwd': self.cwd}
                if os.path.isdir(new_path):
                    self.cwd = new_path
                else:
                    return {'output': f"bash: cd: {target}: No such file or directory\n", 'prompt': self.get_prompt(), 'cwd': self.cwd}
            return {'output': '', 'prompt': self.get_prompt(), 'cwd': self.cwd}

        if base_cmd in ('ls', 'dir'):
            # Format listing with colors
            flags = [t for t in tokens[1:] if t.startswith('-')]
            args = [t for t in tokens[1:] if not t.startswith('-')]
            target = os.path.abspath(os.path.join(self.cwd, args[0])) if args else self.cwd
            if not target.startswith(self.workspace_dir) or not os.path.exists(target):
                return {'output': f"ls: cannot access '{args[0] if args else ''}': No such file or directory\n", 'prompt': self.get_prompt(), 'cwd': self.cwd}

            entries = sorted(os.scandir(target), key=lambda e: (not e.is_dir(), e.name.lower()))
            lines = []
            if '-l' in "".join(flags):
                lines.append(f"total {len(entries)}")
                for e in entries:
                    is_d = e.is_dir()
                    mode = "drwxr-xr-x" if is_d else "-rw-r--r--"
                    size = e.stat().st_size if not is_d else 4096
                    t_str = time.strftime('%b %d %H:%M', time.localtime(e.stat().st_mtime))
                    name_colored = f"\033[1;34m{e.name}/\033[0m" if is_d else (f"\033[1;32m{e.name}*\033[0m" if e.name.endswith(('.exe', '.sh', '.py')) else e.name)
                    lines.append(f"{mode} 1 student student {size:6d} {t_str} {name_colored}")
                out_str = "\n".join(lines) + "\n"
            else:
                out_tokens = []
                for e in entries:
                    if e.is_dir():
                        out_tokens.append(f"\033[1;34m{e.name}/\033[0m")
                    elif e.name.endswith(('.exe', '.sh', '.py')):
                        out_tokens.append(f"\033[1;32m{e.name}*\033[0m")
                    else:
                        out_tokens.append(e.name)
                out_str = "  ".join(out_tokens) + "\n"
            return {'output': out_str, 'prompt': self.get_prompt(), 'cwd': self.cwd}

        if base_cmd == 'cat':
            if len(tokens) < 2:
                return {'output': "cat: missing file operand\n", 'prompt': self.get_prompt(), 'cwd': self.cwd}
            fpath = os.path.abspath(os.path.join(self.cwd, tokens[1]))
            if not fpath.startswith(self.workspace_dir) or not os.path.isfile(fpath):
                return {'output': f"cat: {tokens[1]}: No such file or directory\n", 'prompt': self.get_prompt(), 'cwd': self.cwd}
            with open(fpath, 'r', encoding='utf-8', errors='replace') as f:
                return {'output': f.read() + "\n", 'prompt': self.get_prompt(), 'cwd': self.cwd}

        if base_cmd == 'mkdir':
            if len(tokens) < 2:
                return {'output': "mkdir: missing operand\n", 'prompt': self.get_prompt(), 'cwd': self.cwd}
            dpath = os.path.abspath(os.path.join(self.cwd, tokens[1]))
            if not dpath.startswith(self.workspace_dir):
                return {'output': "mkdir: permission denied\n", 'prompt': self.get_prompt(), 'cwd': self.cwd}
            os.makedirs(dpath, exist_ok=True)
            return {'output': '', 'prompt': self.get_prompt(), 'cwd': self.cwd}

        if base_cmd in ('rm', 'unlink'):
            if len(tokens) < 2:
                return {'output': "rm: missing operand\n", 'prompt': self.get_prompt(), 'cwd': self.cwd}
            tpath = os.path.abspath(os.path.join(self.cwd, tokens[-1]))
            if not tpath.startswith(self.workspace_dir) or tpath == self.workspace_dir:
                return {'output': "rm: cannot remove: permission denied\n", 'prompt': self.get_prompt(), 'cwd': self.cwd}
            if os.path.isdir(tpath):
                import shutil
                shutil.rmtree(tpath)
            elif os.path.isfile(tpath):
                os.remove(tpath)
            return {'output': '', 'prompt': self.get_prompt(), 'cwd': self.cwd}

        if base_cmd == 'nano':
            filename = tokens[1] if len(tokens) > 1 else "untitled.txt"
            fpath = os.path.abspath(os.path.join(self.cwd, filename))
            # Create file if not exists
            if not os.path.exists(fpath):
                with open(fpath, "w", encoding="utf-8") as f:
                    f.write("")
            rel = os.path.relpath(fpath, self.workspace_dir).replace('\\', '/')
            return {
                'output': f"\033[1;36m[Nano Editor]\033[0m Opened '{rel}' in workspace. File is synced with Monaco Editor.\n",
                'prompt': self.get_prompt(),
                'cwd': self.cwd,
                'open_in_editor': rel
            }

        # Big Data command: pig script.pig
        if base_cmd == 'pig':
            if len(tokens) < 2:
                return {'output': "Apache Pig version 0.17.0 (r1797386)\nusage: pig [options] <script.pig>\n", 'prompt': self.get_prompt(), 'cwd': self.cwd}
            script_file = tokens[-1]
            fpath = os.path.abspath(os.path.join(self.cwd, script_file))
            if not os.path.exists(fpath):
                return {'output': f"pig: file not found: {script_file}\n", 'prompt': self.get_prompt(), 'cwd': self.cwd}
            with open(fpath, 'r', encoding='utf-8') as f:
                code = f.read()
            engine = PigEngine(self.cwd)
            res = engine.run_script(code)
            out = res.get('logs', '') + "\n" + res.get('output', '')
            if res.get('error'):
                out += f"\n\033[1;31mError: {res['error']}\033[0m\n"
            return {'output': out + "\n", 'prompt': self.get_prompt(), 'cwd': self.cwd}

        # Hadoop command: hadoop jar ...
        if base_cmd == 'hadoop':
            if len(tokens) >= 3 and tokens[1] == 'jar':
                # MapReduce job execution
                java_files = [t for t in tokens if t.endswith('.java')]
                if java_files:
                    target_java = os.path.join(self.cwd, java_files[0])
                    if os.path.exists(target_java):
                        with open(target_java, 'r', encoding='utf-8') as f:
                            mr_code = f.read()
                        mr_runner = MapReduceRunner(self.cwd)
                        res = mr_runner.run(mr_code)
                        out = res.get('logs', '') + "\n" + res.get('output', '')
                        return {'output': out + "\n", 'prompt': self.get_prompt(), 'cwd': self.cwd}
            return {'output': "Usage: hadoop [--config confdir] COMMAND\nwhere COMMAND is one of: fs, version, jar, checknative, distcp...\n", 'prompt': self.get_prompt(), 'cwd': self.cwd}

        # Python execution
        if base_cmd in ('python', 'python3'):
            py_bin = sys.executable or "python"
            args = [py_bin] + tokens[1:]
            try:
                r = subprocess.run(args, cwd=self.cwd, capture_output=True, text=True, timeout=15)
                out = (r.stdout or '') + (r.stderr or '')
                return {'output': out, 'prompt': self.get_prompt(), 'cwd': self.cwd}
            except Exception as e:
                return {'output': f"python: error: {str(e)}\n", 'prompt': self.get_prompt(), 'cwd': self.cwd}

        # GCC / G++ execution
        if base_cmd in ('gcc', 'g++'):
            try:
                r = subprocess.run(tokens, cwd=self.cwd, capture_output=True, text=True, timeout=15)
                out = (r.stdout or '') + (r.stderr or '')
                return {'output': out, 'prompt': self.get_prompt(), 'cwd': self.cwd}
            except Exception as e:
                return {'output': f"{base_cmd}: error: {str(e)}\n", 'prompt': self.get_prompt(), 'cwd': self.cwd}

        # Java / Javac execution
        if base_cmd in ('java', 'javac'):
            try:
                r = subprocess.run(tokens, cwd=self.cwd, capture_output=True, text=True, timeout=15)
                out = (r.stdout or '') + (r.stderr or '')
                return {'output': out, 'prompt': self.get_prompt(), 'cwd': self.cwd}
            except Exception as e:
                return {'output': f"{base_cmd}: error: {str(e)}\n", 'prompt': self.get_prompt(), 'cwd': self.cwd}

        # Binary execution e.g. ./program or program.exe
        if cmd_str.startswith('./') or cmd_str.endswith(('.exe', '.bat')):
            exe_target = tokens[0].replace('./', '')
            fpath = os.path.abspath(os.path.join(self.cwd, exe_target))
            if os.path.exists(fpath):
                try:
                    r = subprocess.run([fpath] + tokens[1:], cwd=self.cwd, capture_output=True, text=True, timeout=15)
                    out = (r.stdout or '') + (r.stderr or '')
                    return {'output': out, 'prompt': self.get_prompt(), 'cwd': self.cwd}
                except Exception as e:
                    return {'output': f"Execution error: {str(e)}\n", 'prompt': self.get_prompt(), 'cwd': self.cwd}

        # Fallback: run inside system shell with working directory restriction
        try:
            r = subprocess.run(
                cmd_str,
                shell=True,
                cwd=self.cwd,
                capture_output=True,
                text=True,
                timeout=15
            )
            out = (r.stdout or '') + (r.stderr or '')
            return {'output': out, 'prompt': self.get_prompt(), 'cwd': self.cwd}
        except subprocess.TimeoutExpired:
            return {'output': "Command timed out after 15s.\n", 'prompt': self.get_prompt(), 'cwd': self.cwd}
        except Exception as e:
            return {'output': f"bash: {base_cmd}: command not found ({str(e)})\n", 'prompt': self.get_prompt(), 'cwd': self.cwd}

