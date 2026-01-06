from datetime import timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

from app.auth.config import auth_settings
from app.auth.models import PasswordChange, Token, User, UserCreate, UserPublic
from app.auth.service import (
    authenticate_user,
    change_user_password,
    create_access_token,
    create_user,
    delete_user,
    get_current_user,
    get_user_by_email,
)
from app.database import SessionDep

auth_router = APIRouter(tags=["Authentication"])


@auth_router.post("/register", response_model=UserPublic, operation_id="register_user")
async def register_user(user: UserCreate, session: SessionDep) -> UserPublic:
    existing_user = get_user_by_email(session, user.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Email already registered"
        )

    db_user = create_user(session, user)
    return UserPublic.model_validate(db_user)


@auth_router.post("/login", response_model=Token, operation_id="login_user")
async def login_user(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    session: SessionDep,
) -> Token:
    if not form_data.username or not form_data.password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email and password are required",
        )

    user = authenticate_user(session, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=auth_settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return Token(access_token=access_token, token_type="bearer")


@auth_router.get(
    "/users/me/", response_model=UserPublic, operation_id="read_current_user"
)
async def read_current_user(
    current_user: Annotated[User, Depends(get_current_user)],
) -> UserPublic:
    return UserPublic.model_validate(current_user)


@auth_router.post("/change-password", operation_id="change_password")
async def change_password(
    change_password: PasswordChange,
    current_user: Annotated[User, Depends(get_current_user)],
    session: SessionDep,
):
    change_user_password(
        user=current_user,
        old_password=change_password.old_password,
        new_password=change_password.new_password,
        session=session,
    )
    return {"message": "Password changed successfully"}


@auth_router.delete("/users/me", operation_id="delete_current_user")
async def delete_current_user(
    current_user: Annotated[User, Depends(get_current_user)],
    session: SessionDep,
):
    """Delete the current user's account and all associated data."""
    delete_user(session, current_user)
    return {"message": "Account successfully deleted"}
