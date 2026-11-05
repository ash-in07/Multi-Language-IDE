from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from services.hdfs_service import HDFSService

hdfs_bp = Blueprint('hdfs', __name__, url_prefix='/api/hdfs')

def get_current_user_id():
    uid = get_jwt_identity()
    return int(uid) if uid else 1

@hdfs_bp.route('/ls', methods=['GET'])
@jwt_required(optional=True)
def list_hdfs():
    user_id = get_current_user_id()
    path = request.args.get('path', '/')
    items = HDFSService.list_dir(user_id, path)
    return jsonify({
        'current_path': path,
        'cluster_uri': f'hdfs://namenode:9000',
        'items': items
    }), 200

@hdfs_bp.route('/mkdir', methods=['POST'])
@jwt_required(optional=True)
def make_hdfs_dir():
    user_id = get_current_user_id()
    data = request.get_json() or {}
    path = data.get('path', '')
    if not path:
        return jsonify({'error': 'Path required'}), 400
    try:
        res = HDFSService.mkdir(user_id, path)
        return jsonify(res), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@hdfs_bp.route('/upload', methods=['POST'])
@jwt_required(optional=True)
def upload_hdfs():
    user_id = get_current_user_id()
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    f = request.files['file']
    hdfs_dir = request.form.get('path', '/input')
    fname = secure_filename(f.filename)
    target_path = f"{hdfs_dir}/{fname}".replace('//', '/')
    content = f.read()

    res = HDFSService.put_file(user_id, target_path, content)
    return jsonify(res), 201

@hdfs_bp.route('/cat', methods=['GET'])
@jwt_required(optional=True)
def cat_hdfs():
    user_id = get_current_user_id()
    path = request.args.get('path', '')
    if not path:
        return jsonify({'error': 'Path required'}), 400
    try:
        content = HDFSService.cat_file(user_id, path)
        return jsonify({'path': path, 'content': content}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 404

@hdfs_bp.route('/rm', methods=['DELETE'])
@jwt_required(optional=True)
def rm_hdfs():
    user_id = get_current_user_id()
    path = request.args.get('path', '')
    if not path:
        return jsonify({'error': 'Path required'}), 400
    try:
        res = HDFSService.rm(user_id, path)
        return jsonify(res), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

