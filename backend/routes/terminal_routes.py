import uuid
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from terminal.terminal_session import TerminalSession

terminal_bp = Blueprint('terminal', __name__, url_prefix='/api/terminal')

# Active terminal sessions store
terminal_sessions = {}

def get_current_user_id():
    uid = get_jwt_identity()
    return int(uid) if uid else 1

@terminal_bp.route('/session', methods=['POST'])
@jwt_required(optional=True)
def create_session():
    user_id = get_current_user_id()
    session_id = str(uuid.uuid4())
    session = TerminalSession(session_id, user_id=user_id)
    terminal_sessions[session_id] = session

    welcome_banner = (
        "\033[1;35m╔════════════════════════════════════════════════════════════════════╗\033[0m\r\n"
        "\033[1;35m║\033[0m   \033[1;36mBIG DATA ONLINE LAB — INTERACTIVE LINUX TERMINAL (UBUNTU)\033[0m        \033[1;35m║\033[0m\r\n"
        "\033[1;35m║\033[0m   Hadoop 3.3.6 | Apache Pig 0.17.0 | Java 17 | GCC | Python 3.11 \033[1;35m║\033[0m\r\n"
        "\033[1;35m╚════════════════════════════════════════════════════════════════════╝\033[0m\r\n\r\n"
        "Type \033[1;33mls\033[0m, \033[1;33mcat\033[0m, \033[1;33mpig <script.pig>\033[0m, \033[1;33mjavac <file.java>\033[0m, \033[1;33mpython <file.py>\033[0m\r\n"
        "Files created here automatically appear in the Monaco Editor & File Explorer!\r\n\r\n"
    )

    return jsonify({
        'session_id': session_id,
        'banner': welcome_banner,
        'prompt': session.get_prompt(),
        'cwd': session.cwd
    }), 201

@terminal_bp.route('/command', methods=['POST'])
@jwt_required(optional=True)
def execute_command():
    data = request.get_json() or {}
    session_id = data.get('session_id')
    command = data.get('command', '')

    user_id = get_current_user_id()
    session = terminal_sessions.get(session_id)
    if not session:
        session = TerminalSession(session_id or str(uuid.uuid4()), user_id=user_id)
        if session_id:
            terminal_sessions[session_id] = session

    res = session.execute_command(command)
    return jsonify({
        'output': res.get('output', ''),
        'prompt': res.get('prompt', ''),
        'cwd': res.get('cwd', ''),
        'open_in_editor': res.get('open_in_editor')
    }), 200

@terminal_bp.route('/session', methods=['DELETE'])
@jwt_required(optional=True)
def close_session():
    data = request.get_json() or {}
    session_id = data.get('session_id')
    if session_id in terminal_sessions:
        del terminal_sessions[session_id]
    return jsonify({'message': 'Terminal session terminated'}), 200

