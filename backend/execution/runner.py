import os
import sys
import time
import sqlite3
import subprocess
import requests
from config import Config
from execution.pig.pig_engine import PigEngine
from execution.mapreduce.mr_framework import MapReduceRunner

# Active processes tracker for stop button support
active_processes = {}

class ExecutionRunner:
    @staticmethod
    def stop_execution(execution_id):
        """Kills an actively running process."""
        proc = active_processes.get(execution_id)
        if proc:
            try:
                proc.terminate()
                active_processes.pop(execution_id, None)
                return True
            except Exception:
                pass
        return False

    @staticmethod
    def run_code(language, code, workspace_dir, stdin_input="", execution_id=None, args=None):
        """Unified runner for all programming languages."""
        lang = language.lower().strip()
        start_time = time.time()

        try:
            if lang in ('pig', 'apache pig', 'piglatin'):
                engine = PigEngine(workspace_dir)
                res = engine.run_script(code)
                return res

            elif lang in ('mapreduce', 'hadoop', 'hadoop mapreduce'):
                runner = MapReduceRunner(workspace_dir)
                res = runner.run(code)
                return res

            elif lang in ('python', 'py'):
                return ExecutionRunner._run_python(code, workspace_dir, stdin_input, execution_id)

            elif lang in ('c',):
                return ExecutionRunner._run_c(code, workspace_dir, stdin_input, execution_id)

            elif lang in ('cpp', 'c++'):
                return ExecutionRunner._run_cpp(code, workspace_dir, stdin_input, execution_id)

            elif lang in ('java',):
                return ExecutionRunner._run_java(code, workspace_dir, stdin_input, execution_id)

            elif lang in ('javascript', 'js', 'node', 'nodejs'):
                return ExecutionRunner._run_javascript(code, workspace_dir, stdin_input, execution_id)

            elif lang in ('sql', 'sqlite'):
                return ExecutionRunner._run_sql(code, workspace_dir)

            elif lang in ('html', 'html/css', 'web'):
                return {
                    'success': True,
                    'output': code,
                    'logs': 'Rendered live preview in secure sandbox.',
                    'execution_time': 0.01,
                    'is_html_preview': True
                }

            else:
                # Use Piston API for R, Go, PHP, Ruby, Bash, etc.
                return ExecutionRunner._run_piston(lang, code, stdin_input)

        except Exception as e:
            elapsed = time.time() - start_time
            return {
                'success': False,
                'output': '',
                'logs': f"Internal Runner Error: {str(e)}",
                'execution_time': elapsed,
                'error': str(e)
            }

    @staticmethod
    def _run_python(code, workspace_dir, stdin_input="", execution_id=None):
        start_time = time.time()
        script_path = os.path.join(workspace_dir, "temp_program.py")
        with open(script_path, "w", encoding="utf-8") as f:
            f.write(code)

        python_cmd = sys.executable or "python"
        cmd = [python_cmd, "temp_program.py"]
        
        try:
            proc = subprocess.Popen(
                cmd,
                cwd=workspace_dir,
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            if execution_id:
                active_processes[execution_id] = proc

            stdout, stderr = proc.communicate(input=stdin_input, timeout=Config.EXECUTION_TIMEOUT)
            elapsed = time.time() - start_time

            return {
                'success': proc.returncode == 0,
                'output': stdout,
                'logs': f"Process exited with code {proc.returncode}\n{stderr if stderr else ''}",
                'execution_time': elapsed,
                'error': stderr if proc.returncode != 0 else None
            }
        except subprocess.TimeoutExpired:
            proc.kill()
            return {
                'success': False,
                'output': '',
                'logs': f'Execution timed out after {Config.EXECUTION_TIMEOUT}s',
                'execution_time': Config.EXECUTION_TIMEOUT,
                'error': 'Timeout'
            }
        finally:
            if execution_id:
                active_processes.pop(execution_id, None)

    @staticmethod
    def _run_c(code, workspace_dir, stdin_input="", execution_id=None):
        start_time = time.time()
        c_path = os.path.join(workspace_dir, "temp_program.c")
        exe_path = os.path.join(workspace_dir, "temp_program.exe" if os.name == 'nt' else "temp_program.out")
        with open(c_path, "w", encoding="utf-8") as f:
            f.write(code)

        compile_cmd = ["gcc", "temp_program.c", "-o", exe_path]
        compile_res = subprocess.run(compile_cmd, cwd=workspace_dir, capture_output=True, text=True, timeout=15)
        if compile_res.returncode != 0:
            return {
                'success': False,
                'output': '',
                'logs': f"GCC Compilation Error:\n{compile_res.stderr}",
                'execution_time': time.time() - start_time,
                'error': compile_res.stderr
            }

        proc = subprocess.Popen(
            [exe_path],
            cwd=workspace_dir,
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        if execution_id:
            active_processes[execution_id] = proc

        stdout, stderr = proc.communicate(input=stdin_input, timeout=Config.EXECUTION_TIMEOUT)
        return {
            'success': proc.returncode == 0,
            'output': stdout,
            'logs': f"GCC build succeeded.\nProcess exited with code {proc.returncode}",
            'execution_time': time.time() - start_time,
            'error': stderr if proc.returncode != 0 else None
        }

    @staticmethod
    def _run_cpp(code, workspace_dir, stdin_input="", execution_id=None):
        start_time = time.time()
        cpp_path = os.path.join(workspace_dir, "temp_program.cpp")
        exe_path = os.path.join(workspace_dir, "temp_program_cpp.exe" if os.name == 'nt' else "temp_program_cpp.out")
        with open(cpp_path, "w", encoding="utf-8") as f:
            f.write(code)

        compile_cmd = ["g++", "-std=c++17", "temp_program.cpp", "-o", exe_path]
        compile_res = subprocess.run(compile_cmd, cwd=workspace_dir, capture_output=True, text=True, timeout=15)
        if compile_res.returncode != 0:
            return {
                'success': False,
                'output': '',
                'logs': f"G++ Compilation Error:\n{compile_res.stderr}",
                'execution_time': time.time() - start_time,
                'error': compile_res.stderr
            }

        proc = subprocess.Popen(
            [exe_path],
            cwd=workspace_dir,
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        if execution_id:
            active_processes[execution_id] = proc

        stdout, stderr = proc.communicate(input=stdin_input, timeout=Config.EXECUTION_TIMEOUT)
        return {
            'success': proc.returncode == 0,
            'output': stdout,
            'logs': f"G++ build succeeded.\nProcess exited with code {proc.returncode}",
            'execution_time': time.time() - start_time,
            'error': stderr if proc.returncode != 0 else None
        }

    @staticmethod
    def _run_java(code, workspace_dir, stdin_input="", execution_id=None):
        start_time = time.time()
        import re
        m_cls = re.search(r'public\s+class\s+([A-Za-z0-9_]+)', code)
        class_name = m_cls.group(1) if m_cls else "Main"
        java_path = os.path.join(workspace_dir, f"{class_name}.java")
        with open(java_path, "w", encoding="utf-8") as f:
            f.write(code)

        compile_res = subprocess.run(["javac", f"{class_name}.java"], cwd=workspace_dir, capture_output=True, text=True, timeout=15)
        if compile_res.returncode != 0:
            return {
                'success': False,
                'output': '',
                'logs': f"Java Compilation Error:\n{compile_res.stderr}",
                'execution_time': time.time() - start_time,
                'error': compile_res.stderr
            }

        proc = subprocess.Popen(
            ["java", class_name],
            cwd=workspace_dir,
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        if execution_id:
            active_processes[execution_id] = proc

        stdout, stderr = proc.communicate(input=stdin_input, timeout=Config.EXECUTION_TIMEOUT)
        return {
            'success': proc.returncode == 0,
            'output': stdout,
            'logs': f"JVM execution finished.\nProcess exited with code {proc.returncode}",
            'execution_time': time.time() - start_time,
            'error': stderr if proc.returncode != 0 else None
        }

    @staticmethod
    def _run_javascript(code, workspace_dir, stdin_input="", execution_id=None):
        start_time = time.time()
        js_path = os.path.join(workspace_dir, "temp_program.js")
        with open(js_path, "w", encoding="utf-8") as f:
            f.write(code)

        proc = subprocess.Popen(
            ["node", "temp_program.js"],
            cwd=workspace_dir,
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        if execution_id:
            active_processes[execution_id] = proc

        stdout, stderr = proc.communicate(input=stdin_input, timeout=Config.EXECUTION_TIMEOUT)
        return {
            'success': proc.returncode == 0,
            'output': stdout,
            'logs': f"Node.js execution finished.\nProcess exited with code {proc.returncode}",
            'execution_time': time.time() - start_time,
            'error': stderr if proc.returncode != 0 else None
        }

    @staticmethod
    def _run_sql(code, workspace_dir):
        start_time = time.time()
        conn = sqlite3.connect(":memory:")
        cursor = conn.cursor()
        
        output_lines = []
        try:
            # Split queries by semicolon
            statements = [s.strip() for s in code.split(';') if s.strip()]
            for stmt in statements:
                cursor.execute(stmt)
                if cursor.description:
                    columns = [d[0] for d in cursor.description]
                    rows = cursor.fetchall()
                    
                    # Format as markdown table / ASCII table
                    col_widths = [max(len(c), max([len(str(r[i])) for r in rows], default=0)) for i, c in enumerate(columns)]
                    header = " | ".join(c.ljust(col_widths[i]) for i, c in enumerate(columns))
                    sep = "-+-".join("-" * col_widths[i] for i in range(len(columns)))
                    
                    table_lines = [header, sep]
                    for row in rows:
                        table_lines.append(" | ".join(str(row[i]).ljust(col_widths[i]) for i in range(len(columns))))
                    
                    output_lines.append(f"\n[Query Results: {stmt[:40]}...]\n" + "\n".join(table_lines) + f"\n({len(rows)} rows affected)\n")
                else:
                    output_lines.append(f"Statement executed successfully: {stmt[:40]}...")

            conn.commit()
            conn.close()
            return {
                'success': True,
                'output': "\n".join(output_lines),
                'logs': f"SQLite executed {len(statements)} statement(s) successfully.",
                'execution_time': time.time() - start_time,
                'error': None
            }
        except Exception as e:
            conn.close()
            return {
                'success': False,
                'output': "\n".join(output_lines),
                'logs': f"SQL Syntax/Execution Error: {str(e)}",
                'execution_time': time.time() - start_time,
                'error': str(e)
            }

    @staticmethod
    def _run_piston(language, code, stdin_input=""):
        """Calls Piston API for languages not locally installed (R, Go, PHP, Ruby, Bash, etc.)."""
        start_time = time.time()
        payload = {
            "language": language,
            "version": "*",
            "files": [{"content": code}],
            "stdin": stdin_input
        }
        try:
            resp = requests.post(f"{Config.PISTON_API_URL}/execute", json=payload, timeout=12)
            if resp.status_code == 200:
                data = resp.json()
                run_info = data.get('run', {})
                stdout = run_info.get('stdout', '')
                stderr = run_info.get('stderr', '')
                code_exit = run_info.get('code', 0)
                return {
                    'success': code_exit == 0,
                    'output': stdout,
                    'logs': f"Executed via Isolated Container Engine ({language})\nExit code: {code_exit}",
                    'execution_time': time.time() - start_time,
                    'error': stderr if code_exit != 0 else None
                }
        except Exception:
            pass

        # Fallback message
        return {
            'success': False,
            'output': '',
            'logs': f"Language '{language}' runner was not reachable.",
            'execution_time': time.time() - start_time,
            'error': f"Runner for '{language}' unavailable. Ensure network access or local binary is configured."
        }

