import os
import csv
import json
from flask import Blueprint, request, jsonify, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from config import Config
from extensions import db
from models import Dataset
from services.workspace_service import WorkspaceService

dataset_bp = Blueprint('datasets', __name__, url_prefix='/api/datasets')

def get_current_user_id():
    uid = get_jwt_identity()
    return int(uid) if uid else 1

@dataset_bp.route('', methods=['GET'])
@jwt_required(optional=True)
def list_datasets():
    user_id = get_current_user_id()
    # User's uploaded datasets
    user_datasets = Dataset.query.filter_by(user_id=user_id).order_by(Dataset.created_at.desc()).all()
    
    # Also include global sample datasets
    sample_files = []
    if os.path.exists(Config.DATASETS_DIR):
        for fname in sorted(os.listdir(Config.DATASETS_DIR)):
            fpath = os.path.join(Config.DATASETS_DIR, fname)
            if os.path.isfile(fpath):
                sample_files.append({
                    'id': f"sample_{fname}",
                    'filename': fname,
                    'file_size': os.path.getsize(fpath),
                    'is_sample': True,
                    'created_at': None
                })

    return jsonify({
        'user_datasets': [d.to_dict() for d in user_datasets],
        'sample_datasets': sample_files
    }), 200

@dataset_bp.route('/upload', methods=['POST'])
@jwt_required(optional=True)
def upload_dataset():
    user_id = get_current_user_id()
    if 'file' not in request.files:
        return jsonify({'error': 'No file part in request'}), 400

    f = request.files['file']
    if not f or f.filename == '':
        return jsonify({'error': 'No file chosen'}), 400

    fname = secure_filename(f.filename)
    user_workspace = WorkspaceService.get_workspace_dir(user_id)
    save_path = os.path.join(user_workspace, fname)
    f.save(save_path)

    fsize = os.path.getsize(save_path)
    dataset = Dataset(
        user_id=user_id,
        filename=fname,
        file_path=save_path,
        file_size=fsize
    )
    db.session.add(dataset)
    db.session.commit()

    return jsonify({
        'message': 'Dataset uploaded successfully to workspace and catalogue.',
        'dataset': dataset.to_dict()
    }), 201

@dataset_bp.route('/preview/<string:filename>', methods=['GET'])
@jwt_required(optional=True)
def preview_dataset(filename):
    user_id = get_current_user_id()
    user_workspace = WorkspaceService.get_workspace_dir(user_id)
    
    # Check user workspace first, then global datasets
    fpath = os.path.join(user_workspace, filename)
    if not os.path.exists(fpath):
        fpath = os.path.join(Config.DATASETS_DIR, filename)
    if not os.path.exists(fpath):
        return jsonify({'error': f'Dataset {filename} not found'}), 404

    # Determine type
    ext = os.path.splitext(filename)[1].lower()
    columns = []
    rows = []
    total_lines = 0

    try:
        with open(fpath, 'r', encoding='utf-8', errors='replace') as f:
            if ext in ('.csv', '.tsv', '.txt'):
                delimiter = '\t' if ext == '.tsv' else (',' if ',' in f.readline() else '\t')
                f.seek(0)
                reader = csv.reader(f, delimiter=delimiter)
                header_detected = False
                for idx, r in enumerate(reader):
                    total_lines += 1
                    if idx == 0:
                        columns = r
                        header_detected = True
                    elif idx <= 50: # Limit preview to first 50 rows
                        rows.append(r)
                if not header_detected:
                    columns = [f"col_{i}" for i in range(len(rows[0]) if rows else 0)]
            elif ext == '.json':
                data = json.load(f)
                if isinstance(data, list):
                    total_lines = len(data)
                    preview_data = data[:50]
                    if preview_data and isinstance(preview_data[0], dict):
                        columns = list(preview_data[0].keys())
                        for item in preview_data:
                            rows.append([item.get(c, '') for c in columns])
                    else:
                        columns = ['Value']
                        rows = [[str(x)] for x in preview_data]
            else:
                # Raw text preview
                for idx, line in enumerate(f):
                    total_lines += 1
                    if idx < 50:
                        rows.append([line.rstrip('\r\n')])
                columns = ['Content']

        return jsonify({
            'filename': filename,
            'columns': columns,
            'rows': rows,
            'total_rows_estimated': total_lines,
            'file_size': os.path.getsize(fpath)
        }), 200

    except Exception as e:
        return jsonify({'error': f'Failed to parse dataset preview: {str(e)}'}), 500

@dataset_bp.route('/<string:filename>/download', methods=['GET'])
@jwt_required(optional=True)
def download_dataset(filename):
    user_id = get_current_user_id()
    user_workspace = WorkspaceService.get_workspace_dir(user_id)
    fpath = os.path.join(user_workspace, filename)
    if not os.path.exists(fpath):
        fpath = os.path.join(Config.DATASETS_DIR, filename)
    if not os.path.exists(fpath):
        return jsonify({'error': 'File not found'}), 404
    return send_file(fpath, as_attachment=True)

