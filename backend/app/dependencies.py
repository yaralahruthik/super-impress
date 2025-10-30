from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import Session

from app.database import get_session
from app.models.user import User
from app.auth import get_user_by_email, decode_token

SessionDep = Annotated[Session, Depends(get_session)]

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login/swagger")


async def get_current_user(
    session: SessionDep,
    access_token: Annotated[str | None, Depends(oauth2_scheme)] = None,
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

    payload = decode_token(access_token)
    if payload is None or payload.type != "access":
        raise credentials_exception

    user = get_user_by_email(session, payload.sub)
    if user is None:
        raise credentials_exception

    return user


CurrentUser = Annotated[User, Depends(get_current_user)]
