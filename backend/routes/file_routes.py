import os
from flask import Blueprint, request, jsonify, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from services.workspace_service import WorkspaceService

file_bp = Blueprint('files', __name__, url_prefix='/api/files')

def get_current_user_id():
    uid = get_jwt_identity()
    return int(uid) if uid else 1

@file_bp.route('', methods=['GET'])
@jwt_required(optional=True)
def list_files():
    user_id = get_current_user_id()
    tree = WorkspaceService.list_files(user_id)
    return jsonify({'files': tree}), 200

@file_bp.route('', methods=['POST'])
@jwt_required(optional=True)
def create_file_or_folder():
    user_id = get_current_user_id()
    data = request.get_json() or {}
    path = data.get('path', '').strip()
    is_dir = data.get('is_directory', False)
    content = data.get('content', '')

    if not path:
        return jsonify({'error': 'Path is required'}), 400

    try:
        if is_dir:
            res = WorkspaceService.create_directory(user_id, path)
        else:
            res = WorkspaceService.write_file(user_id, path, content)
        return jsonify({'item': res}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@file_bp.route('/content', methods=['GET', 'POST'])
@jwt_required(optional=True)
def file_content():
    user_id = get_current_user_id()
    if request.method == 'GET':
        path = request.args.get('path', '')
        if not path:
            return jsonify({'error': 'Path required'}), 400
        try:
            content = WorkspaceService.read_file(user_id, path)
            return jsonify({'path': path, 'content': content}), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 404
    else:
        data = request.get_json() or {}
        path = data.get('path', '')
        content = data.get('content', '')
        try:
            res = WorkspaceService.write_file(user_id, path, content)
            return jsonify({'saved': True, 'file': res}), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 400

@file_bp.route('/upload', methods=['POST'])
@jwt_required(optional=True)
def upload_file():
    user_id = get_current_user_id()
    if 'file' not in request.files:
        return jsonify({'error': 'No file part in request'}), 400

    f = request.files['file']
    if not f or f.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    fname = secure_filename(f.filename)
    dest_path = os.path.join(WorkspaceService.get_workspace_dir(user_id), fname)
    f.save(dest_path)

    return jsonify({
        'message': 'File uploaded to workspace successfully',
        'filename': fname,
        'size': os.path.getsize(dest_path)
    }), 201

@file_bp.route('/<path:filepath>/download', methods=['GET'])
@jwt_required(optional=True)
def download_file(filepath):
    user_id = get_current_user_id()
    workspace = WorkspaceService.get_workspace_dir(user_id)
    target = os.path.abspath(os.path.join(workspace, filepath))
    if not target.startswith(workspace) or not os.path.isfile(target):
        return jsonify({'error': 'File not found'}), 404
    return send_file(target, as_attachment=True)

@file_bp.route('/<path:filepath>', methods=['DELETE'])
@jwt_required(optional=True)
def delete_file(filepath):
    user_id = get_current_user_id()
    try:
        res = WorkspaceService.delete_item(user_id, filepath)
        return jsonify(res), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@file_bp.route('/rename', methods=['POST'])
@jwt_required(optional=True)
def rename_file():
    user_id = get_current_user_id()
    data = request.get_json() or {}
    old_p = data.get('old_path', '')
    new_p = data.get('new_path', '')
    try:
        res = WorkspaceService.rename_item(user_id, old_p, new_p)
        return jsonify(res), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

