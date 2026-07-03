from datetime import datetime, timedelta

from flask import Blueprint, current_app, jsonify, request
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    get_jwt,
    get_jwt_identity,
    jwt_required,
)

from app.extensions import db
from app.models.token import PasswordResetToken, TokenBlocklist
from app.models.user import User
from app.utils.email import send_password_reset_email

auth_bp = Blueprint('auth', __name__)


# ─── helpers ──────────────────────────────────────────────────────────────────

def _make_tokens(user: User):
    claims        = {'role': user.role.value, 'name': user.name}
    access_token  = create_access_token(identity=str(user.id), additional_claims=claims)
    refresh_token = create_refresh_token(identity=str(user.id), additional_claims=claims)
    return access_token, refresh_token


# ─── routes ───────────────────────────────────────────────────────────────────

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json(silent=True) or {}
    email    = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''

    if not email or not password:
        return jsonify({'error': 'Email and password are required.'}), 400

    user = User.query.filter_by(email=email).first()

    if not user or not user.check_password(password):
        return jsonify({'error': 'Invalid email or password.'}), 401

    if not user.is_active:
        return jsonify({'error': 'Your account has been deactivated. Contact your administrator.'}), 403

    access_token, refresh_token = _make_tokens(user)
    return jsonify({
        'access_token':  access_token,
        'refresh_token': refresh_token,
        'user':          user.to_dict(),
    }), 200


@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    jti = get_jwt()['jti']
    if TokenBlocklist.query.filter_by(jti=jti).first():
        return jsonify({'error': 'Refresh token has been revoked.'}), 401

    user = User.query.get(int(get_jwt_identity()))
    if not user or not user.is_active:
        return jsonify({'error': 'User not found or inactive.'}), 401

    claims       = {'role': user.role.value, 'name': user.name}
    access_token = create_access_token(identity=str(user.id), additional_claims=claims)
    return jsonify({'access_token': access_token}), 200


@auth_bp.route('/logout', methods=['POST'])
@jwt_required(refresh=True)
def logout():
    jti = get_jwt()['jti']
    db.session.add(TokenBlocklist(jti=jti))
    db.session.commit()
    return jsonify({'message': 'Logged out successfully.'}), 200


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_me():
    user = User.query.get(int(get_jwt_identity()))
    if not user:
        return jsonify({'error': 'User not found.'}), 404
    return jsonify({'user': user.to_dict()}), 200


@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    data  = request.get_json(silent=True) or {}
    email = (data.get('email') or '').strip().lower()

    if not email:
        return jsonify({'error': 'Email is required.'}), 400

    # Generic response prevents email enumeration
    success_msg = {
        'message': 'If that email is registered, a reset link has been sent.'
    }

    user = User.query.filter_by(email=email).first()
    if not user or not user.is_active:
        return jsonify(success_msg), 200

    # Invalidate any existing live tokens for this user
    PasswordResetToken.query.filter_by(user_id=user.id, used=False).update({'used': True})

    raw_token, token_hash = PasswordResetToken.generate_token()
    expires_min = current_app.config['RESET_TOKEN_EXPIRES']
    reset_token = PasswordResetToken(
        user_id    = user.id,
        token_hash = token_hash,
        expires_at = datetime.utcnow() + timedelta(minutes=expires_min),
    )
    db.session.add(reset_token)
    db.session.commit()

    try:
        send_password_reset_email(user.email, user.name, raw_token)
    except Exception as exc:
        current_app.logger.error('Reset email failed: %s', exc)
        return jsonify({'error': 'Could not send reset email. Please try again later.'}), 500

    return jsonify(success_msg), 200


@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    data     = request.get_json(silent=True) or {}
    raw      = data.get('token', '').strip()
    password = data.get('password', '')

    if not raw or not password:
        return jsonify({'error': 'Token and new password are required.'}), 400

    if len(password) < 8:
        return jsonify({'error': 'Password must be at least 8 characters.'}), 400

    token_hash  = PasswordResetToken.hash_token(raw)
    reset_token = PasswordResetToken.query.filter_by(token_hash=token_hash).first()

    if not reset_token or not reset_token.is_valid():
        return jsonify({'error': 'This reset link is invalid or has expired.'}), 400

    user = User.query.get(reset_token.user_id)
    if not user or not user.is_active:
        return jsonify({'error': 'User not found.'}), 400

    user.set_password(password)
    reset_token.used = True
    db.session.commit()

    return jsonify({'message': 'Password updated. You can now log in.'}), 200
