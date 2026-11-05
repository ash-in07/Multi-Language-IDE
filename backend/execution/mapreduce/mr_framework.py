import os
import re
import time
import subprocess
from config import Config

class MapReduceRunner:
    """
    Executes Java Hadoop MapReduce programs with full compilation,
    Map phase, Shuffle & Sort phase, Reduce phase, and part-r-00000 generation.
    """
    def __init__(self, workspace_dir):
        self.workspace_dir = workspace_dir
        self.jar_path = os.path.abspath(os.path.join(
            os.path.dirname(__file__), "hadoop-core.jar"
        ))

    def run(self, java_code, input_file=None, output_dir=None):
        start_time = time.time()
        
        # 1. Determine public class name or default to WordCount
        m_class = re.search(r'public\s+class\s+([A-Za-z0-9_]+)', java_code)
        class_name = m_class.group(1) if m_class else "WordCount"

        java_file_path = os.path.join(self.workspace_dir, f"{class_name}.java")
        with open(java_file_path, "w", encoding="utf-8") as f:
            f.write(java_code)

        # 2. Compile Java MapReduce program with hadoop-core.jar in classpath
        # Path separator on Windows is ';', on Unix is ':'
        sep = ';' if os.name == 'nt' else ':'
        classpath = f".{sep}{self.jar_path}"

        compile_cmd = ["javac", "-cp", classpath, f"{class_name}.java"]
        
        try:
            compile_res = subprocess.run(
                compile_cmd,
                cwd=self.workspace_dir,
                capture_output=True,
                text=True,
                timeout=Config.EXECUTION_TIMEOUT
            )
            
            if compile_res.returncode != 0:
                elapsed = time.time() - start_time
                return {
                    'success': False,
                    'output': '',
                    'logs': f"Hadoop MapReduce Compilation Failed:\n{compile_res.stderr}",
                    'execution_time': elapsed,
                    'error': compile_res.stderr
                }

        except subprocess.TimeoutExpired:
            return {
                'success': False,
                'output': '',
                'logs': 'Compilation timed out.',
                'execution_time': Config.EXECUTION_TIMEOUT,
                'error': 'Compilation timed out.'
            }
        except Exception as e:
            return {
                'success': False,
                'output': '',
                'logs': str(e),
                'execution_time': 0,
                'error': str(e)
            }

        # 3. Clean up any previous output directory if specified
        out_folder_name = output_dir or f"output_{class_name.lower()}"
        out_folder_path = os.path.join(self.workspace_dir, out_folder_name)
        if os.path.exists(out_folder_path):
            import shutil
            try:
                shutil.rmtree(out_folder_path)
            except Exception:
                pass

        # 4. Run MapReduce Job
        run_cmd = ["java", "-cp", classpath, class_name]
        if input_file:
            run_cmd.append(input_file)
        if output_dir:
            run_cmd.append(output_dir)

        try:
            run_res = subprocess.run(
                run_cmd,
                cwd=self.workspace_dir,
                capture_output=True,
                text=True,
                timeout=Config.EXECUTION_TIMEOUT
            )

            elapsed = time.time() - start_time
            stdout = run_res.stdout
            stderr = run_res.stderr

            # 5. Read generated part-r-00000 file
            output_content = ""
            part_file = os.path.join(out_folder_path, "part-r-00000")
            if os.path.exists(part_file):
                with open(part_file, "r", encoding="utf-8", errors="replace") as f:
                    output_content = f.read()
            elif stdout:
                output_content = stdout

            logs = f"=== Hadoop MapReduce Job Execution ===\nClass: {class_name}\n"
            if stderr:
                logs += f"\n[Job Logs / Warnings]:\n{stderr}\n"
            if stdout and stdout != output_content:
                logs += f"\n[Job Output / Counters]:\n{stdout}\n"

            return {
                'success': run_res.returncode == 0,
                'output': output_content,
                'logs': logs,
                'execution_time': elapsed,
                'error': stderr if run_res.returncode != 0 else None
            }

        except subprocess.TimeoutExpired:
            return {
                'success': False,
                'output': '',
                'logs': f'Execution timed out after {Config.EXECUTION_TIMEOUT}s.',
                'execution_time': Config.EXECUTION_TIMEOUT,
                'error': 'Execution timed out.'
            }
        except Exception as e:
            return {
                'success': False,
                'output': '',
                'logs': str(e),
                'execution_time': time.time() - start_time,
                'error': str(e)
            }

