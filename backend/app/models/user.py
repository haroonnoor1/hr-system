import enum
from datetime import datetime
from app.extensions import db, bcrypt


class RoleEnum(enum.Enum):
    admin    = 'admin'
    manager  = 'manager'
    employee = 'employee'


class User(db.Model):
    __tablename__ = 'users'

    id            = db.Column(db.Integer, primary_key=True)
    name          = db.Column(db.String(100), nullable=False)
    email         = db.Column(db.String(150), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role          = db.Column(db.Enum(RoleEnum), nullable=False, default=RoleEnum.employee)
    is_active     = db.Column(db.Boolean, default=True)
    # Self-referential FK so Manager rows can link to their direct reports
    manager_id    = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    created_at    = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at    = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    subordinates  = db.relationship(
        'User', backref=db.backref('manager', remote_side=[id])
    )
    reset_tokens  = db.relationship(
        'PasswordResetToken', back_populates='user', lazy='dynamic'
    )

    # ------------------------------------------------------------------
    def set_password(self, password: str) -> None:
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password: str) -> bool:
        return bcrypt.check_password_hash(self.password_hash, password)

    def to_dict(self) -> dict:
        return {
            'id':         self.id,
            'name':       self.name,
            'email':      self.email,
            'role':       self.role.value,
            'is_active':  self.is_active,
            'manager_id': self.manager_id,
            'created_at': self.created_at.isoformat(),
        }
