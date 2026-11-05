import uuid
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models import ExecutionHistory
from services.workspace_service import WorkspaceService
from execution.runner import ExecutionRunner

execute_bp = Blueprint('execute', __name__, url_prefix='/api/execution')

def get_current_user_id():
    uid = get_jwt_identity()
    return int(uid) if uid else 1

@execute_bp.route('', methods=['POST'])
@jwt_required(optional=True)
def execute_code():
    user_id = get_current_user_id()
    data = request.get_json() or {}
    language = data.get('language', 'python')
    code = data.get('code', '')
    stdin_input = data.get('stdin', '')
    program_id = data.get('program_id')

    if not code.strip():
        return jsonify({'error': 'Source code cannot be empty'}), 400

    workspace_dir = WorkspaceService.get_workspace_dir(user_id)
    execution_token = str(uuid.uuid4())

    res = ExecutionRunner.run_code(
        language=language,
        code=code,
        workspace_dir=workspace_dir,
        stdin_input=stdin_input,
        execution_id=execution_token
    )

    status = 'SUCCESS' if res.get('success') else 'ERROR'
    if res.get('error') == 'Timeout':
        status = 'TIMEOUT'

    # Save to ExecutionHistory
    history = ExecutionHistory(
        user_id=user_id,
        program_id=program_id if isinstance(program_id, int) else None,
        execution_status=status,
        execution_time=res.get('execution_time', 0.0),
        output=res.get('output', ''),
        error_message=res.get('error') or ''
    )
    try:
        db.session.add(history)
        db.session.commit()
        hist_dict = history.to_dict()
    except Exception:
        db.session.rollback()
        hist_dict = {}

    return jsonify({
        'execution_id': history.id if history.id else execution_token,
        'status': status,
        'output': res.get('output', ''),
        'logs': res.get('logs', ''),
        'error': res.get('error'),
        'execution_time': res.get('execution_time', 0.0),
        'is_html_preview': res.get('is_html_preview', False),
        'history': hist_dict
    }), 200

# Dedicated Pig execution route as per spec
@execute_bp.route('/pig', methods=['POST'])
@jwt_required(optional=True)
def execute_pig():
    data = request.get_json() or {}
    data['language'] = 'pig'
    request.data = data
    return execute_code()

# Dedicated MapReduce execution route as per spec
@execute_bp.route('/mapreduce', methods=['POST'])
@jwt_required(optional=True)
def execute_mapreduce():
    data = request.get_json() or {}
    data['language'] = 'mapreduce'
    request.data = data
    return execute_code()

@execute_bp.route('/history', methods=['GET'])
@jwt_required(optional=True)
def execution_history():
    user_id = get_current_user_id()
    records = ExecutionHistory.query.filter_by(user_id=user_id).order_by(ExecutionHistory.created_at.desc()).limit(50).all()
    return jsonify({'history': [r.to_dict() for r in records]}), 200

@execute_bp.route('/<int:exec_id>', methods=['GET'])
@jwt_required(optional=True)
def get_execution(exec_id):
    user_id = get_current_user_id()
    record = ExecutionHistory.query.filter_by(id=exec_id, user_id=user_id).first()
    if not record:
        return jsonify({'error': 'Execution record not found'}), 404
    return jsonify({'execution': record.to_dict()}), 200

@execute_bp.route('/<string:exec_id>/stop', methods=['POST'])
@jwt_required(optional=True)
def stop_execution(exec_id):
    stopped = ExecutionRunner.stop_execution(exec_id)
    return jsonify({'stopped': stopped}), 200

