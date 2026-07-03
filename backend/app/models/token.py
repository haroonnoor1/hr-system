import hashlib
import secrets
from datetime import datetime
from app.extensions import db


class PasswordResetToken(db.Model):
    __tablename__ = 'password_reset_tokens'

    id         = db.Column(db.Integer, primary_key=True)
    user_id    = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    token_hash = db.Column(db.String(64), nullable=False)   # SHA-256 hex digest
    expires_at = db.Column(db.DateTime, nullable=False)
    used       = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', back_populates='reset_tokens')

    # ------------------------------------------------------------------
    @staticmethod
    def generate_token():
        """Return (raw_token, token_hash). Store the hash; mail the raw token."""
        raw   = secrets.token_urlsafe(32)
        hashed = hashlib.sha256(raw.encode()).hexdigest()
        return raw, hashed

    @staticmethod
    def hash_token(raw: str) -> str:
        return hashlib.sha256(raw.encode()).hexdigest()

    def is_valid(self) -> bool:
        return not self.used and datetime.utcnow() < self.expires_at


class TokenBlocklist(db.Model):
    """Stores JTIs of revoked refresh tokens (used on logout)."""
    __tablename__ = 'token_blocklist'

    id         = db.Column(db.Integer, primary_key=True)
    jti        = db.Column(db.String(36), nullable=False, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
