from typing import Annotated

from fastapi import Cookie, Depends, HTTPException, status
from sqlmodel import Session

from app.database import get_session
from app.models.user import User
from app.auth import get_user_by_email, decode_token

SessionDep = Annotated[Session, Depends(get_session)]


async def get_current_user(
    session: SessionDep,
    access_token: Annotated[str | None, Cookie()] = None,
) -> User:
    """
    Get the current authenticated user
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if access_token is None:
        raise credentials_exception

    email = decode_token(access_token)
    if email is None:
        raise credentials_exception

    user = get_user_by_email(session, email)
    if user is None:
        raise credentials_exception

    return user


async def get_current_active_user(
    current_user: Annotated[User, Depends(get_current_user)],
) -> User:
    return current_user


CurrentUser = Annotated[User, Depends(get_current_active_user)]
