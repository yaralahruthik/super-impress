from datetime import datetime, timedelta, timezone
from typing import Annotated

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jwt.exceptions import InvalidTokenError
from pwdlib import PasswordHash
from pydantic import EmailStr
from sqlalchemy import select

from app.auth.config import auth_settings
from app.auth.models import TokenData, User, UserCreate
from app.database import SessionDep

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")


password_hash = PasswordHash.recommended()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return password_hash.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return password_hash.hash(password)


def create_user(session: SessionDep, user: UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = User(email=user.email, password=hashed_password, email_verified=False)
    session.add(db_user)
    session.commit()
    session.refresh(db_user)

    return db_user


def get_user_by_email(session: SessionDep, email: EmailStr):
    statement = select(User).where(User.email == email)
    user = session.scalars(statement).first()
    return user


def authenticate_user(session: SessionDep, email: EmailStr, password: str):
    user = get_user_by_email(session, email)
    if not user:
        return False
    if not verify_password(password, user.password):
        return False
    return user


def create_access_token(
    data: dict[str, str | datetime], expires_delta: timedelta | None = None
):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(
        to_encode, auth_settings.secret_key, algorithm=auth_settings.algorithm
    )
    return encoded_jwt


async def get_current_user(
    session: SessionDep, token: Annotated[str, Depends(oauth2_scheme)]
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            token, auth_settings.secret_key, algorithms=[auth_settings.algorithm]
        )
        email = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except InvalidTokenError:
        raise credentials_exception
    user = get_user_by_email(session, email=token_data.email)
    if user is None:
        raise credentials_exception
    return user


def change_user_password(
    user: User, old_password: str, new_password: str, session: SessionDep
):
    if not verify_password(old_password, user.password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect old password",
        )

    user.password = get_password_hash(new_password)
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


def get_verified_user(current_user: Annotated[User, Depends(get_current_user)]):
    """Ensure user has verified their email."""
    if not current_user.email_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Please verify your email address first",
        )
    return current_user


def delete_user(session: SessionDep, user: User) -> None:
    """Delete user and all associated data.

    Posts and social_connections will cascade automatically via ondelete="CASCADE".
    """
    session.delete(user)
    session.commit()
