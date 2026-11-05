import os
import json
from flask import Blueprint, jsonify
from config import Config

sample_bp = Blueprint('samples', __name__, url_prefix='/api/samples')

@sample_bp.route('', methods=['GET'])
def list_samples():
    manifest_path = os.path.join(Config.SAMPLES_DIR, 'samples_manifest.json')
    if os.path.exists(manifest_path):
        try:
            with open(manifest_path, 'r', encoding='utf-8') as f:
                samples = json.load(f)
            return jsonify({'samples': samples}), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    return jsonify({'samples': []}), 200

