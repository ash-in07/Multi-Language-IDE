import os
from datetime import timedelta

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
ROOT_DIR = os.path.abspath(os.path.join(BASE_DIR, '..'))

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'big-data-online-lab-super-secret-key-2026')
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'jwt-big-data-secret-key-2026')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=7)
    
    # Database
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        'DATABASE_URL', 
        f"sqlite:///{os.path.join(BASE_DIR, 'bigdata_lab.db')}"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Storage Paths
    WORKSPACES_DIR = os.path.join(ROOT_DIR, 'workspaces')
    DATASETS_DIR = os.path.join(ROOT_DIR, 'datasets')
    SAMPLES_DIR = os.path.join(ROOT_DIR, 'samples')
    HDFS_STORAGE_DIR = os.path.join(ROOT_DIR, 'hdfs_storage')
    
    # Execution Settings
    EXECUTION_TIMEOUT = int(os.environ.get('EXECUTION_TIMEOUT', 30))
    MAX_FILE_SIZE = int(os.environ.get('MAX_FILE_SIZE', 25 * 1024 * 1024)) # 25 MB
    
    # Execution Engine Mode ('local', 'docker', 'hybrid')
    EXECUTION_MODE = os.environ.get('EXECUTION_MODE', 'hybrid')
    DOCKER_PIG_IMAGE = os.environ.get('DOCKER_PIG_IMAGE', 'apache/hadoop:3.3.6')
    PISTON_API_URL = os.environ.get('PISTON_API_URL', 'https://emkc.org/api/v2/piston')

