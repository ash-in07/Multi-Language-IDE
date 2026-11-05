import os
import shutil
import time
from config import Config

class HDFSService:
    @staticmethod
    def get_hdfs_root(user_id=1):
        """Returns the user's isolated HDFS root directory."""
        hdfs_dir = os.path.join(Config.HDFS_STORAGE_DIR, f"user_{user_id}")
        os.makedirs(hdfs_dir, exist_ok=True)
        # Pre-seed standard HDFS directories if empty
        for standard_dir in ['input', 'output', 'user', 'tmp']:
            os.makedirs(os.path.join(hdfs_dir, standard_dir), exist_ok=True)
        return hdfs_dir

    @staticmethod
    def list_dir(user_id=1, rel_path="/"):
        """Lists files and directories in HDFS with block and replica metadata."""
        root = HDFSService.get_hdfs_root(user_id)
        clean_rel = rel_path.strip("/\\")
        target_dir = os.path.abspath(os.path.join(root, clean_rel))
        if not target_dir.startswith(root):
            target_dir = root
            clean_rel = ""
        
        items = []
        if os.path.exists(target_dir):
            for entry in os.scandir(target_dir):
                entry_rel = os.path.join(clean_rel, entry.name).replace('\\', '/')
                is_dir = entry.is_dir()
                stat = entry.stat()
                items.append({
                    'name': entry.name,
                    'path': f"/{entry_rel}".replace('//', '/'),
                    'is_directory': is_dir,
                    'size': stat.st_size if not is_dir else 0,
                    'permissions': 'drwxr-xr-x' if is_dir else '-rw-r--r--',
                    'replication': 3 if not is_dir else '-',
                    'block_size': '128 MB' if not is_dir else '-',
                    'owner': f'hadoop_user{user_id}',
                    'group': 'supergroup',
                    'modified': time.strftime('%Y-%m-%d %H:%M', time.localtime(stat.st_mtime))
                })
        return items

    @staticmethod
    def mkdir(user_id=1, hdfs_path=""):
        """Creates a directory in HDFS."""
        root = HDFSService.get_hdfs_root(user_id)
        clean = hdfs_path.strip("/\\")
        target = os.path.abspath(os.path.join(root, clean))
        if not target.startswith(root):
            raise ValueError("Invalid HDFS path")
        os.makedirs(target, exist_ok=True)
        return {'status': 'SUCCESS', 'path': f"/{clean}"}

    @staticmethod
    def put_file(user_id=1, hdfs_path="", content_bytes=b""):
        """Uploads/writes a file to HDFS path."""
        root = HDFSService.get_hdfs_root(user_id)
        clean = hdfs_path.strip("/\\")
        target = os.path.abspath(os.path.join(root, clean))
        if not target.startswith(root):
            raise ValueError("Invalid HDFS path")
        os.makedirs(os.path.dirname(target), exist_ok=True)
        with open(target, 'wb') as f:
            f.write(content_bytes)
        return {'status': 'SUCCESS', 'path': f"/{clean}", 'size': len(content_bytes)}

    @staticmethod
    def cat_file(user_id=1, hdfs_path=""):
        """Reads content of an HDFS file."""
        root = HDFSService.get_hdfs_root(user_id)
        clean = hdfs_path.strip("/\\")
        target = os.path.abspath(os.path.join(root, clean))
        if not target.startswith(root) or not os.path.isfile(target):
            raise FileNotFoundError(f"HDFS File not found: {hdfs_path}")
        with open(target, 'r', encoding='utf-8', errors='replace') as f:
            return f.read()

    @staticmethod
    def rm(user_id=1, hdfs_path=""):
        """Removes a file or directory from HDFS."""
        root = HDFSService.get_hdfs_root(user_id)
        clean = hdfs_path.strip("/\\")
        target = os.path.abspath(os.path.join(root, clean))
        if not target.startswith(root) or target == root:
            raise ValueError("Cannot remove root HDFS directory")
        if not os.path.exists(target):
            raise FileNotFoundError(f"HDFS path not found: {hdfs_path}")
        if os.path.isdir(target):
            shutil.rmtree(target)
        else:
            os.remove(target)
        return {'status': 'SUCCESS', 'deleted': f"/{clean}"}

