import os
from flask import Flask, jsonify
from config import Config
from extensions import db, jwt, cors
from routes.auth_routes import auth_bp
from routes.program_routes import program_bp
from routes.execute_routes import execute_bp
from routes.file_routes import file_bp
from routes.terminal_routes import terminal_bp
from routes.dataset_routes import dataset_bp
from routes.hdfs_routes import hdfs_bp
from routes.sample_routes import sample_bp
from services.workspace_service import WorkspaceService
from models import User

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    cors.init_app(app, resources={r"/api/*": {"origins": "*"}})

    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(program_bp)
    app.register_blueprint(execute_bp)
    app.register_blueprint(file_bp)
    app.register_blueprint(terminal_bp)
    app.register_blueprint(dataset_bp)
    app.register_blueprint(hdfs_bp)
    app.register_blueprint(sample_bp)

    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({
            'status': 'HEALTHY',
            'service': 'Big Data Online Lab API',
            'version': '2.0.0',
            'engines': {
                'pig': 'Apache Pig 0.17.0 (Local / Hadoop)',
                'mapreduce': 'Hadoop MapReduce 3.3.6 (MRv2)',
                'python': 'Python 3.11/3.14',
                'c_cpp': 'GCC / G++ 16.1.0',
                'java': 'OpenJDK 17',
                'node': 'Node.js 26.x'
            }
        }), 200

    # Ensure database tables and starter guest user exist
    with app.app_context():
        db.create_all()
        # Seed default guest user if database is new
        guest = User.query.filter_by(username='guest').first()
        if not guest:
            guest = User(id=1, username='guest', email='guest@bigdatalab.edu')
            guest.set_password('guest123')
            db.session.add(guest)
            db.session.commit()
            WorkspaceService.init_user_workspace(1)

    return app

app = create_app()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"Starting Big Data Online Lab Backend on http://0.0.0.0:{port}")
    app.run(host='0.0.0.0', port=port, debug=False)

