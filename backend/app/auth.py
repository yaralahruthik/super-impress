from datetime import datetime, timedelta, timezone
import jwt
from jwt.exceptions import InvalidTokenError
from pydantic import ValidationError
from pwdlib import PasswordHash
from sqlmodel import Session, select

from app.config import settings
from app.models.token import TokenPayload
from app.models.user import User

password_hash = PasswordHash.recommended()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hash"""
    return password_hash.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash a password"""
    return password_hash.hash(password)


def get_user_by_email(session: Session, email: str) -> User | None:
    """Get a user from the database by email"""
    statement = select(User).where(User.email == email)
    user = session.exec(statement).first()
    return user


def authenticate_user(session: Session, email: str, password: str) -> User | None:
    """Authenticate a user with email and password"""
    user = get_user_by_email(session, email)
    if not user:
        return None
    if not verify_password(password, user.password):
        return None
    return user


def create_access_token(subject: str, expires_delta: timedelta | None = None) -> str:
    """Create a JWT access token"""
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)

    to_encode = {"sub": subject, "exp": expire, "type": "access"}
    encoded_jwt = jwt.encode(
        to_encode, settings.secret_key, algorithm=settings.algorithm
    )
    return encoded_jwt


def create_refresh_token(subject: str, expires_delta: timedelta | None = None) -> str:
    """Create a JWT refresh token"""
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=settings.refresh_token_expire_minutes
        )

    to_encode = {"sub": subject, "exp": expire, "type": "refresh"}
    encoded_jwt = jwt.encode(
        to_encode, settings.secret_key, algorithm=settings.algorithm
    )
    return encoded_jwt


def decode_token(token: str) -> TokenPayload | None:
    """Decode a JWT token and return the email"""
    try:
        payload = jwt.decode(
            token, settings.secret_key, algorithms=[settings.algorithm]
        )
        return TokenPayload.model_validate(payload)
    except (InvalidTokenError, ValidationError):
        return None


def create_user(session: Session, name: str, email: str, password: str) -> User:
    """Create a new user in the database"""
    hashed_password = get_password_hash(password)
    user = User(
        name=name,
        email=email,
        password=hashed_password,
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user
