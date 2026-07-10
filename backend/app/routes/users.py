from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt, get_jwt_identity, jwt_required

from app.extensions import db
from app.models.user import RoleEnum, User
from app.utils.decorators import role_required

users_bp = Blueprint('users', __name__)

# ── List Users ─────────────────────────────────────────────────────────────────
@users_bp.route('', methods=['GET'])
@jwt_required()
def list_users():
    claims = get_jwt()
    role   = claims.get('role')
    uid    = int(get_jwt_identity())

    if role == 'admin':
        users = User.query.order_by(User.created_at.desc()).all()
    elif role == 'manager':
        users = User.query.filter(
            (User.manager_id == uid) | (User.id == uid)
        ).order_by(User.created_at.desc()).all()
    else:
        users = User.query.filter_by(id=uid).all()

    return jsonify({'users': [u.to_dict() for u in users]}), 200


# ── Stats ──────────────────────────────────────────────────────────────────────
@users_bp.route('/stats', methods=['GET'])
@jwt_required()
@role_required('admin', 'manager')
def get_stats():
    total     = User.query.count()
    active    = User.query.filter_by(is_active=True).count()
    admins    = User.query.filter_by(role=RoleEnum.admin).count()
    managers  = User.query.filter_by(role=RoleEnum.manager).count()
    employees = User.query.filter_by(role=RoleEnum.employee).count()
    return jsonify({
        'total': total, 'active': active, 'inactive': total - active,
        'admins': admins, 'managers': managers, 'employees': employees,
    }), 200


# ── Create User (Admin only) ───────────────────────────────────────────────────
@users_bp.route('', methods=['POST'])
@jwt_required()
@role_required('admin')
def create_user():
    data       = request.get_json(silent=True) or {}
    name       = (data.get('name')     or '').strip()
    email      = (data.get('email')    or '').strip().lower()
    password   = (data.get('password') or '').strip()
    role       = (data.get('role')     or 'employee').strip().lower()
    manager_id = data.get('manager_id')

    if not name or not email or not password:
        return jsonify({'error': 'Name, email and password are required.'}), 400
    if len(password) < 8:
        return jsonify({'error': 'Password must be at least 8 characters.'}), 400
    if role not in ['admin', 'manager', 'employee']:
        return jsonify({'error': 'Invalid role.'}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'A user with this email already exists.'}), 409

    user = User(
        name       = name,
        email      = email,
        role       = RoleEnum[role],
        manager_id = int(manager_id) if manager_id else None,
    )
    user.set_password(password)
    db.session.add(user)
    db.session.commit()
    return jsonify({'message': 'User created successfully.', 'user': user.to_dict()}), 201


# ── Get Single User ────────────────────────────────────────────────────────────
@users_bp.route('/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user(user_id):
    claims = get_jwt()
    role   = claims.get('role')
    uid    = int(get_jwt_identity())

    if role == 'employee' and uid != user_id:
        return jsonify({'error': 'Insufficient permissions.'}), 403

    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found.'}), 404
    return jsonify({'user': user.to_dict()}), 200


# ── Update User ────────────────────────────────────────────────────────────────
@users_bp.route('/<int:user_id>', methods=['PUT'])
@jwt_required()
def update_user(user_id):
    claims = get_jwt()
    role   = claims.get('role')
    uid    = int(get_jwt_identity())

    if role != 'admin' and uid != user_id:
        return jsonify({'error': 'Insufficient permissions.'}), 403

    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found.'}), 404

    data = request.get_json(silent=True) or {}

    if data.get('name', '').strip():
        user.name = data['name'].strip()

    if data.get('email', '').strip():
        new_email = data['email'].strip().lower()
        existing  = User.query.filter_by(email=new_email).first()
        if existing and existing.id != user_id:
            return jsonify({'error': 'Email already in use.'}), 409
        user.email = new_email

    if role == 'admin':
        if data.get('role') in ['admin', 'manager', 'employee']:
            user.role = RoleEnum[data['role']]
        if 'manager_id' in data:
            user.manager_id = int(data['manager_id']) if data['manager_id'] else None

    if data.get('password', '').strip():
        new_password = data['password'].strip()
        if len(new_password) < 8:
            return jsonify({'error': 'Password must be at least 8 characters.'}), 400

        # Admins changing someone else's password don't need to prove the
        # target's current password. But a user changing their OWN password
        # (including an admin editing themselves) must verify it first.
        if uid == user_id:
            current_password = (data.get('current_password') or '').strip()
            if not current_password:
                return jsonify({'error': 'Current password is required.'}), 400
            if not user.check_password(current_password):
                return jsonify({'error': 'Current password is incorrect.'}), 401

        user.set_password(new_password)

    db.session.commit()
    return jsonify({'message': 'User updated successfully.', 'user': user.to_dict()}), 200


# ── Delete User (Admin only) ───────────────────────────────────────────────────
@users_bp.route('/<int:user_id>', methods=['DELETE'])
@jwt_required()
@role_required('admin')
def delete_user(user_id):
    uid = int(get_jwt_identity())
    if uid == user_id:
        return jsonify({'error': 'You cannot delete your own account.'}), 400
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found.'}), 404
    db.session.delete(user)
    db.session.commit()
    return jsonify({'message': 'User deleted successfully.'}), 200


# ── Toggle Status (Admin only) ─────────────────────────────────────────────────
@users_bp.route('/<int:user_id>/toggle-status', methods=['PATCH'])
@jwt_required()
@role_required('admin')
def toggle_status(user_id):
    uid = int(get_jwt_identity())
    if uid == user_id:
        return jsonify({'error': 'You cannot deactivate your own account.'}), 400
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found.'}), 404
    user.is_active = not user.is_active
    db.session.commit()
    status = 'activated' if user.is_active else 'deactivated'
    return jsonify({'message': f'User {status} successfully.', 'user': user.to_dict()}), 200
