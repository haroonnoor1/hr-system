import secrets
import hashlib
from datetime import datetime, timedelta, timezone

from app.extensions import db


class PasswordResetToken(db.Model):
    __tablename__ = "password_reset_tokens"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    token_hash = db.Column(db.String(128), unique=True, nullable=False, index=True)
    expires_at = db.Column(db.DateTime, nullable=False)
    used = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    @staticmethod
    def _hash(raw_token: str) -> str:
        return hashlib.sha256(raw_token.encode("utf-8")).hexdigest()

    @classmethod
    def generate(cls, user_id: int, expires_minutes: int) -> tuple["PasswordResetToken", str]:
        """Returns (model instance to persist, raw token to email to the user).
        Only the hash is stored — the raw token is never saved, so a DB leak
        alone can't be used to reset passwords.
        """
        raw_token = secrets.token_urlsafe(32)
        instance = cls(
            user_id=user_id,
            token_hash=cls._hash(raw_token),
            expires_at=datetime.now(timezone.utc) + timedelta(minutes=expires_minutes),
        )
        return instance, raw_token

    @classmethod
    def find_valid(cls, raw_token: str) -> "PasswordResetToken | None":
        token_hash = cls._hash(raw_token)
        candidate = cls.query.filter_by(token_hash=token_hash, used=False).first()
        if not candidate:
            return None
        expires_at = candidate.expires_at
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        if expires_at < datetime.now(timezone.utc):
            return None
        return candidate
