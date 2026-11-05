import unittest
import json
import os
import sys

# Ensure backend directory is in path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import create_app
from extensions import db
from models import User, Program, ExecutionHistory

class BigDataLabTestSuite(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.app = create_app()
        cls.app.config['TESTING'] = True
        cls.client = cls.app.test_client()

    def test_01_health_check(self):
        resp = self.client.get('/api/health')
        self.assertEqual(resp.status_code, 200)
        data = resp.get_json()
        self.assertEqual(data['status'], 'HEALTHY')
        self.assertIn('pig', data['engines'])
        self.assertIn('mapreduce', data['engines'])

    def test_02_auth_workflow(self):
        # 1. Register test user
        uname = 'test_student_2026'
        resp = self.client.post('/api/auth/register', json={
            'username': uname,
            'email': 'student2026@college.edu',
            'password': 'password123'
        })
        self.assertIn(resp.status_code, (201, 409)) # 409 if exists

        # 2. Login
        login_resp = self.client.post('/api/auth/login', json={
            'username': uname,
            'password': 'password123'
        })
        self.assertEqual(login_resp.status_code, 200)
        data = login_resp.get_json()
        self.assertIn('token', data)
        self.token = data['token']

    def test_03_pig_execution(self):
        pig_script = """
        students = LOAD 'students.csv' USING PigStorage(',') AS (
            id:int, name:chararray, age:int, gender:chararray, major:chararray, gpa:float, credits:int
        );
        cs = FILTER students BY major == 'Computer Science';
        DUMP cs;
        """
        resp = self.client.post('/api/execution', json={
            'language': 'pig',
            'code': pig_script
        })
        self.assertEqual(resp.status_code, 200)
        data = resp.get_json()
        self.assertEqual(data['status'], 'SUCCESS')
        self.assertIn('DUMP Output (cs)', data['output'])
        self.assertIn('Alice Johnson', data['output'])

    def test_04_mapreduce_execution(self):
        manifest_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../samples/samples_manifest.json'))
        with open(manifest_path, 'r', encoding='utf-8') as f:
            samples = json.load(f)
        wc = next(s for s in samples if s['id'] == 'mr_01_wordcount')
        
        resp = self.client.post('/api/execution', json={
            'language': 'mapreduce',
            'code': wc['code']
        })
        self.assertEqual(resp.status_code, 200)
        data = resp.get_json()
        self.assertEqual(data['status'], 'SUCCESS')
        self.assertIn('Hadoop', data['output'])
        self.assertIn('MapReduce', data['output'])

    def test_05_python_execution(self):
        code = "print(sum([x * 2 for x in range(10)]))"
        resp = self.client.post('/api/execution', json={
            'language': 'python',
            'code': code
        })
        self.assertEqual(resp.status_code, 200)
        data = resp.get_json()
        self.assertEqual(data['status'], 'SUCCESS')
        self.assertEqual(data['output'].strip(), "90")

    def test_06_sql_execution(self):
        sql = """
        CREATE TABLE test_tab (id INT, val TEXT);
        INSERT INTO test_tab VALUES (1, 'Hadoop');
        SELECT * FROM test_tab;
        """
        resp = self.client.post('/api/execution', json={
            'language': 'sql',
            'code': sql
        })
        self.assertEqual(resp.status_code, 200)
        data = resp.get_json()
        self.assertEqual(data['status'], 'SUCCESS')
        self.assertIn('Hadoop', data['output'])

    def test_07_terminal_session(self):
        # Create session
        sess_resp = self.client.post('/api/terminal/session')
        self.assertEqual(sess_resp.status_code, 201)
        sess_id = sess_resp.get_json()['session_id']

        # Execute command
        cmd_resp = self.client.post('/api/terminal/command', json={
            'session_id': sess_id,
            'command': 'pwd'
        })
        self.assertEqual(cmd_resp.status_code, 200)
        self.assertIn('/home/student', cmd_resp.get_json()['output'])

    def test_08_hdfs_operations(self):
        # Make HDFS directory
        mkdir_resp = self.client.post('/api/hdfs/mkdir', json={'path': '/test_mr_input'})
        self.assertEqual(mkdir_resp.status_code, 201)

        # List HDFS directory
        ls_resp = self.client.get('/api/hdfs/ls?path=/')
        self.assertEqual(ls_resp.status_code, 200)
        names = [item['name'] for item in ls_resp.get_json()['items']]
        self.assertIn('test_mr_input', names)

        # Cleanup
        rm_resp = self.client.delete('/api/hdfs/rm?path=/test_mr_input')
        self.assertEqual(rm_resp.status_code, 200)

if __name__ == '__main__':
    unittest.main()

