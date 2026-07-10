import os
from flask import Flask
from app.config import config
from app.extensions import db, jwt, mail, bcrypt, cors


def create_app(config_name: str = 'default') -> Flask:
    app = Flask(__name__)
    app.config.from_object(config[config_name])

    db.init_app(app)
    jwt.init_app(app)
    mail.init_app(app)
    bcrypt.init_app(app)
    cors.init_app(app, resources={r'/api/*': {'origins': '*'}})

    # ── Error handlers ─────────────────────────────────────────────────────────
    from app.errors import register_error_handlers
    register_error_handlers(app)

    # ── Blueprints ─────────────────────────────────────────────────────────────
    from app.routes.auth  import auth_bp
    from app.routes.users import users_bp
    app.register_blueprint(auth_bp,  url_prefix='/api/auth')
    app.register_blueprint(users_bp, url_prefix='/api/users')

    # ── JWT callbacks ──────────────────────────────────────────────────────────
    from app.models.token import TokenBlocklist

    @jwt.token_in_blocklist_loader
    def check_blocklist(jwt_header, jwt_payload):
        return TokenBlocklist.query.filter_by(jti=jwt_payload['jti']).first() is not None

    @jwt.expired_token_loader
    def expired_token(jwt_header, jwt_payload):
        return {'error': 'Token has expired.', 'code': 'token_expired'}, 401

    @jwt.invalid_token_loader
    def invalid_token(error):
        return {'error': 'Invalid token.', 'code': 'invalid_token'}, 401

    @jwt.unauthorized_loader
    def missing_token(error):
        return {'error': 'Authentication required.', 'code': 'auth_required'}, 401

    # ── DB + seed ──────────────────────────────────────────────────────────────
    with app.app_context():
        db.create_all()
        _seed_admin()

    return app


def _seed_admin():
    from app.models.user import User, RoleEnum
    if User.query.filter_by(role=RoleEnum.admin).first():
        return
    admin = User(name='System Admin', email='admin@hrms.com', role=RoleEnum.admin)
    admin.set_password('Admin@1234')
    db.session.add(admin)
    db.session.commit()
    print('✅  Default admin seeded → admin@hrms.com / Admin@1234')
