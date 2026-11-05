from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from extensions import db
from models import User
from services.workspace_service import WorkspaceService

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    username = data.get('username', '').strip()
    email = data.get('email', '').strip()
    password = data.get('password', '').strip()

    if not username or not email or not password:
        return jsonify({'error': 'Username, email, and password are required'}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({'error': 'Username already taken'}), 409
    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already registered'}), 409

    user = User(username=username, email=email)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    # Initialize workspace for this new student user
    WorkspaceService.init_user_workspace(user.id)
    token = create_access_token(identity=str(user.id))

    return jsonify({
        'message': 'Registration successful',
        'user': user.to_dict(),
        'token': token
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    username = data.get('username', '').strip()
    password = data.get('password', '').strip()

    user = User.query.filter((User.username == username) | (User.email == username)).first()
    if not user or not user.check_password(password):
        return jsonify({'error': 'Invalid credentials'}), 401

    WorkspaceService.init_user_workspace(user.id)
    token = create_access_token(identity=str(user.id))

    return jsonify({
        'message': 'Login successful',
        'user': user.to_dict(),
        'token': token
    }), 200

@auth_bp.route('/logout', methods=['POST'])
def logout():
    return jsonify({'message': 'Logged out successfully'}), 200

@auth_bp.route('/me', methods=['GET'])
@jwt_required(optional=True)
def get_current_user():
    user_id = get_jwt_identity()
    if not user_id:
        # Provide default guest profile for instant exploration without forcing registration
        return jsonify({
            'user': {'id': 1, 'username': 'student_guest', 'email': 'guest@bigdata.lab'},
            'is_guest': True
        }), 200
    user = User.query.get(int(user_id))
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify({'user': user.to_dict(), 'is_guest': False}), 200

