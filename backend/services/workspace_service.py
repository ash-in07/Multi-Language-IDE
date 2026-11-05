import os
import shutil
from config import Config

class WorkspaceService:
    @staticmethod
    def get_workspace_dir(user_id=1):
        """Returns the absolute path to the user's isolated workspace."""
        user_dir = os.path.join(Config.WORKSPACES_DIR, f"user_{user_id}")
        os.makedirs(user_dir, exist_ok=True)
        return user_dir

    @staticmethod
    def init_user_workspace(user_id=1):
        """Initializes a new user workspace with default starter practical files and sample datasets."""
        workspace = WorkspaceService.get_workspace_dir(user_id)
        
        # Copy common datasets to user workspace so Pig / MapReduce / Python can load them directly by filename
        if os.path.exists(Config.DATASETS_DIR):
            for file in os.listdir(Config.DATASETS_DIR):
                src = os.path.join(Config.DATASETS_DIR, file)
                dest = os.path.join(workspace, file)
                if os.path.isfile(src) and not os.path.exists(dest):
                    try:
                        shutil.copy2(src, dest)
                    except Exception:
                        pass

        # Create starter files if workspace is empty of code
        starter_files = {
            'welcome.py': (
                "# Welcome to Big Data Online Lab!\n"
                "# Write your code here or load sample programs from the left sidebar.\n\n"
                "import sys\n"
                "print('=== Welcome to Big Data Online Lab ===')\n"
                "print(f'Python Version: {sys.version.split()[0]}')\n"
                "print('Ready for Big Data, Hadoop MapReduce, and Multi-Language programming!')\n"
            ),
            'student_analytics.pig': (
                "-- Apache Pig Latin Dataflow Script\n"
                "-- Loads student dataset, filters CS students, and dumps results\n\n"
                "students = LOAD 'students.csv' USING PigStorage(',') AS (\n"
                "    id:int, name:chararray, age:int, gender:chararray, major:chararray, gpa:float, credits:int\n"
                ");\n\n"
                "cs_students = FILTER students BY major == 'Computer Science';\n"
                "top_cs = FOREACH cs_students GENERATE name, major, gpa;\n\n"
                "DUMP top_cs;\n"
            ),
            'WordCount.java': (
                "import java.io.IOException;\n"
                "import java.util.StringTokenizer;\n"
                "import org.apache.hadoop.conf.Configuration;\n"
                "import org.apache.hadoop.fs.Path;\n"
                "import org.apache.hadoop.io.IntWritable;\n"
                "import org.apache.hadoop.io.Text;\n"
                "import org.apache.hadoop.mapreduce.Job;\n"
                "import org.apache.hadoop.mapreduce.Mapper;\n"
                "import org.apache.hadoop.mapreduce.Reducer;\n"
                "import org.apache.hadoop.mapreduce.lib.input.FileInputFormat;\n"
                "import org.apache.hadoop.mapreduce.lib.output.FileOutputFormat;\n\n"
                "public class WordCount {\n"
                "    public static class TokenizerMapper extends Mapper<Object, Text, Text, IntWritable> {\n"
                "        private final static IntWritable one = new IntWritable(1);\n"
                "        private Text word = new Text();\n"
                "        public void map(Object key, Text value, Context context) throws IOException, InterruptedException {\n"
                "            StringTokenizer itr = new StringTokenizer(value.toString());\n"
                "            while (itr.hasMoreTokens()) {\n"
                "                word.set(itr.nextToken().replaceAll(\"[^a-zA-Z]\", \"\"));\n"
                "                if (word.getLength() > 0) context.write(word, one);\n"
                "            }\n"
                "        }\n"
                "    }\n"
                "    public static class IntSumReducer extends Reducer<Text, IntWritable, Text, IntWritable> {\n"
                "        private IntWritable result = new IntWritable();\n"
                "        public void reduce(Text key, Iterable<IntWritable> values, Context context) throws IOException, InterruptedException {\n"
                "            int sum = 0;\n"
                "            for (IntWritable val : values) sum += val.get();\n"
                "            result.set(sum);\n"
                "            context.write(key, result);\n"
                "        }\n"
                "    }\n"
                "    public static void main(String[] args) throws Exception {\n"
                "        Configuration conf = new Configuration();\n"
                "        Job job = Job.getInstance(conf, \"word count\");\n"
                "        job.setJarByClass(WordCount.class);\n"
                "        job.setMapperClass(TokenizerMapper.class);\n"
                "        job.setCombinerClass(IntSumReducer.class);\n"
                "        job.setReducerClass(IntSumReducer.class);\n"
                "        job.setOutputKeyClass(Text.class);\n"
                "        job.setOutputValueClass(IntWritable.class);\n"
                "        FileInputFormat.addInputPath(job, new Path(\"wordcount_input.txt\"));\n"
                "        FileOutputFormat.setOutputPath(job, new Path(\"output_wordcount\"));\n"
                "        System.exit(job.waitForCompletion(true) ? 0 : 1);\n"
                "    }\n"
                "}\n"
            ),
            'sorting.cpp': (
                "#include <iostream>\n"
                "#include <vector>\n"
                "#include <algorithm>\n\n"
                "int main() {\n"
                "    std::cout << \"=== Big Data Lab C++ Performance Test ===\\n\";\n"
                "    std::vector<int> numbers = {45, 12, 85, 32, 89, 39, 69, 44, 42, 1, 107};\n"
                "    std::sort(numbers.begin(), numbers.end());\n"
                "    std::cout << \"Sorted: \";\n"
                "    for (int n : numbers) std::cout << n << \" \";\n"
                "    std::cout << \"\\nCompleted successfully.\\n\";\n"
                "    return 0;\n"
                "}\n"
            )
        }
        
        for name, content in starter_files.items():
            fpath = os.path.join(workspace, name)
            if not os.path.exists(fpath):
                with open(fpath, 'w', encoding='utf-8') as f:
                    f.write(content)

    @staticmethod
    def list_files(user_id=1):
        """Returns a nested file explorer structure for the user workspace."""
        workspace = WorkspaceService.get_workspace_dir(user_id)
        WorkspaceService.init_user_workspace(user_id)
        
        def build_tree(current_path, rel_base=""):
            items = []
            try:
                entries = sorted(os.scandir(current_path), key=lambda e: (not e.is_dir(), e.name.lower()))
                for entry in entries:
                    rel_path = os.path.join(rel_base, entry.name).replace('\\', '/')
                    if entry.is_dir():
                        items.append({
                            'id': rel_path,
                            'name': entry.name,
                            'type': 'folder',
                            'path': rel_path,
                            'children': build_tree(entry.path, rel_path)
                        })
                    else:
                        items.append({
                            'id': rel_path,
                            'name': entry.name,
                            'type': 'file',
                            'path': rel_path,
                            'size': entry.stat().st_size,
                            'modified': entry.stat().st_mtime
                        })
            except Exception as e:
                pass
            return items

        return build_tree(workspace)

    @staticmethod
    def read_file(user_id, rel_path):
        """Reads content of a file in the workspace securely."""
        workspace = WorkspaceService.get_workspace_dir(user_id)
        safe_path = os.path.abspath(os.path.join(workspace, rel_path.lstrip('/\\')))
        if not safe_path.startswith(workspace):
            raise ValueError("Access Denied: Path is outside workspace")
        if not os.path.exists(safe_path) or os.path.isdir(safe_path):
            raise FileNotFoundError(f"File not found: {rel_path}")
        with open(safe_path, 'r', encoding='utf-8', errors='replace') as f:
            return f.read()

    @staticmethod
    def write_file(user_id, rel_path, content):
        """Writes or updates a file in the workspace securely."""
        workspace = WorkspaceService.get_workspace_dir(user_id)
        safe_path = os.path.abspath(os.path.join(workspace, rel_path.lstrip('/\\')))
        if not safe_path.startswith(workspace):
            raise ValueError("Access Denied: Path is outside workspace")
        os.makedirs(os.path.dirname(safe_path), exist_ok=True)
        with open(safe_path, 'w', encoding='utf-8') as f:
            f.write(content)
        return {
            'name': os.path.basename(safe_path),
            'path': rel_path.replace('\\', '/'),
            'size': len(content.encode('utf-8'))
        }

    @staticmethod
    def create_directory(user_id, rel_path):
        """Creates a directory in the workspace securely."""
        workspace = WorkspaceService.get_workspace_dir(user_id)
        safe_path = os.path.abspath(os.path.join(workspace, rel_path.lstrip('/\\')))
        if not safe_path.startswith(workspace):
            raise ValueError("Access Denied: Path is outside workspace")
        os.makedirs(safe_path, exist_ok=True)
        return {'name': os.path.basename(safe_path), 'path': rel_path.replace('\\', '/')}

    @staticmethod
    def delete_item(user_id, rel_path):
        """Deletes a file or directory securely."""
        workspace = WorkspaceService.get_workspace_dir(user_id)
        safe_path = os.path.abspath(os.path.join(workspace, rel_path.lstrip('/\\')))
        if not safe_path.startswith(workspace) or safe_path == workspace:
            raise ValueError("Access Denied: Cannot delete root workspace")
        if not os.path.exists(safe_path):
            raise FileNotFoundError(f"Item not found: {rel_path}")
        if os.path.isdir(safe_path):
            shutil.rmtree(safe_path)
        else:
            os.remove(safe_path)
        return {'success': True, 'path': rel_path}

    @staticmethod
    def rename_item(user_id, old_rel_path, new_rel_path):
        """Renames a file or folder securely."""
        workspace = WorkspaceService.get_workspace_dir(user_id)
        old_path = os.path.abspath(os.path.join(workspace, old_rel_path.lstrip('/\\')))
        new_path = os.path.abspath(os.path.join(workspace, new_rel_path.lstrip('/\\')))
        if not old_path.startswith(workspace) or not new_path.startswith(workspace):
            raise ValueError("Access Denied: Path outside workspace")
        if not os.path.exists(old_path):
            raise FileNotFoundError(f"Item not found: {old_rel_path}")
        os.rename(old_path, new_path)
        return {'old_path': old_rel_path, 'new_path': new_rel_path}

