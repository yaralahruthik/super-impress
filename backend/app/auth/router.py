from datetime import timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

from app.auth.models import Token, User, UserCreate, UserPublic
from app.auth.service import (
    authenticate_user,
    create_access_token,
    create_user,
    get_current_user,
)
from app.config import settings
from app.database import SessionDep

auth_router = APIRouter()


@auth_router.post("/register", response_model=UserPublic)
async def register_user(user: UserCreate, session: SessionDep) -> UserPublic:
    db_user = create_user(session, user)
    return UserPublic.model_validate(db_user)


@auth_router.post("/login")
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    session: SessionDep,
) -> Token:
    user = authenticate_user(session, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return Token(access_token=access_token, token_type="bearer")


@auth_router.get("/users/me/", response_model=UserPublic)
async def read_users_me(
    current_user: Annotated[User, Depends(get_current_user)],
):
    return UserPublic.model_validate(current_user)
