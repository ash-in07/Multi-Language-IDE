from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models import Program

program_bp = Blueprint('programs', __name__, url_prefix='/api/programs')

def get_current_user_id():
    uid = get_jwt_identity()
    return int(uid) if uid else 1

@program_bp.route('', methods=['GET'])
@jwt_required(optional=True)
def list_programs():
    user_id = get_current_user_id()
    programs = Program.query.filter_by(user_id=user_id).order_by(Program.updated_at.desc()).all()
    return jsonify({'programs': [p.to_dict() for p in programs]}), 200

@program_bp.route('', methods=['POST'])
@jwt_required(optional=True)
def create_program():
    user_id = get_current_user_id()
    data = request.get_json() or {}
    title = data.get('title', 'Untitled Program').strip()
    language = data.get('language', 'python').strip()
    source_code = data.get('source_code', '')

    prog = Program(
        user_id=user_id,
        title=title,
        language=language,
        source_code=source_code
    )
    db.session.add(prog)
    db.session.commit()
    return jsonify({'program': prog.to_dict()}), 201

@program_bp.route('/<int:prog_id>', methods=['GET'])
@jwt_required(optional=True)
def get_program(prog_id):
    user_id = get_current_user_id()
    prog = Program.query.filter_by(id=prog_id, user_id=user_id).first()
    if not prog:
        return jsonify({'error': 'Program not found'}), 404
    return jsonify({'program': prog.to_dict()}), 200

@program_bp.route('/<int:prog_id>', methods=['PUT'])
@jwt_required(optional=True)
def update_program(prog_id):
    user_id = get_current_user_id()
    prog = Program.query.filter_by(id=prog_id, user_id=user_id).first()
    if not prog:
        return jsonify({'error': 'Program not found'}), 404

    data = request.get_json() or {}
    if 'title' in data:
        prog.title = data['title'].strip()
    if 'language' in data:
        prog.language = data['language'].strip()
    if 'source_code' in data:
        prog.source_code = data['source_code']

    db.session.commit()
    return jsonify({'program': prog.to_dict()}), 200

@program_bp.route('/<int:prog_id>', methods=['DELETE'])
@jwt_required(optional=True)
def delete_program(prog_id):
    user_id = get_current_user_id()
    prog = Program.query.filter_by(id=prog_id, user_id=user_id).first()
    if not prog:
        return jsonify({'error': 'Program not found'}), 404

    db.session.delete(prog)
    db.session.commit()
    return jsonify({'message': 'Program deleted successfully'}), 200

