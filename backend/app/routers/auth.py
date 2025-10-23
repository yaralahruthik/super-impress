from datetime import timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

from app.models.auth import (
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    RegisterResponse,
)
from app.models.user import UserPublic
from app.dependencies import SessionDep
from app.auth import (
    authenticate_user,
    create_access_token,
    create_user,
    get_user_by_email,
)
from app.config import settings

router = APIRouter(tags=["auth"])


@router.post(
    "/register", response_model=RegisterResponse, status_code=status.HTTP_201_CREATED
)
async def register(user_data: RegisterRequest, session: SessionDep) -> RegisterResponse:
    # Check if email already exists
    existing_email = get_user_by_email(session, user_data.email)
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered"
        )

    # Create new user
    user = create_user(
        session=session,
        name=user_data.name,
        email=user_data.email,
        password=user_data.password,
    )

    return RegisterResponse(
        message="User created successfully. Please login to continue.",
        user=UserPublic.model_validate(user),
    )


@router.post("/login", response_model=LoginResponse)
async def login(login_data: LoginRequest, session: SessionDep) -> LoginResponse:
    user = authenticate_user(session, login_data.email, login_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Generate access token
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        subject=user.email, expires_delta=access_token_expires
    )

    return LoginResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserPublic.model_validate(user),
    )


@router.post("/login/swagger")
async def login_swagger_ui(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()], session: SessionDep
):
    """
    OAuth2 compatible login endpoint for Swagger UI.
    Regular clients should use the /login endpoint instead.

    Note: Use your email as the username in Swagger UI.
    """
    user = authenticate_user(session, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        subject=user.email, expires_delta=access_token_expires
    )

    return {"access_token": access_token, "token_type": "bearer"}
