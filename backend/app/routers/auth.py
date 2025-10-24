from datetime import timedelta

from fastapi import APIRouter, HTTPException, Response, status

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
async def login(
    login_data: LoginRequest, session: SessionDep, response: Response
) -> LoginResponse:
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

    # Set HTTP-only cookie
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=settings.cookie_secure,
        samesite="lax",
        max_age=settings.access_token_expire_minutes * 60,
        domain=settings.cookie_domain,
    )

    return LoginResponse(
        message="Login successful",
        user=UserPublic.model_validate(user),
    )


@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie(
        key="access_token",
        httponly=True,
        secure=settings.cookie_secure,
        samesite="lax",
        domain=settings.cookie_domain,
    )
    return {"message": "Successfully logged out"}
