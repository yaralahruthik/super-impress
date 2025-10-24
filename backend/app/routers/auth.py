from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, HTTPException, Request, Response, status

from app.models.auth import (
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    RegisterResponse,
)
from app.models.user import UserPublic
from app.dependencies import SessionDep, CurrentUser
from app.auth import (
    authenticate_user,
    create_access_token,
    create_refresh_token,
    decode_token,
    get_password_hash,
    verify_password,
    create_user,
    get_user_by_email,
)
from app.config import settings

router = APIRouter(tags=["auth"])


@router.post(
    "/register", response_model=RegisterResponse, status_code=status.HTTP_201_CREATED
)
async def register(user_data: RegisterRequest, session: SessionDep) -> RegisterResponse:
    existing_email = get_user_by_email(session, user_data.email)
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered"
        )

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

    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        subject=user.email, expires_delta=access_token_expires
    )

    refresh_token_expires = timedelta(minutes=settings.refresh_token_expire_minutes)
    refresh_token = create_refresh_token(
        subject=user.email, expires_delta=refresh_token_expires
    )
    user.refresh_token = get_password_hash(refresh_token)
    user.refresh_token_expires_at = datetime.now(timezone.utc) + refresh_token_expires
    session.add(user)
    session.commit()

    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=settings.cookie_secure,
        samesite="lax",
        max_age=settings.access_token_expire_minutes * 60,
        domain=settings.cookie_domain,
    )

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=settings.cookie_secure,
        samesite="lax",
        max_age=int(refresh_token_expires.total_seconds()),
        domain=settings.cookie_domain,
    )

    return LoginResponse(
        message="Login successful",
        user=UserPublic.model_validate(user),
    )


@router.post("/logout")
async def logout(response: Response, user: CurrentUser, session: SessionDep):
    if user:
        user.refresh_token = None
        user.refresh_token_expires_at = None
        session.add(user)
        session.commit()

    response.delete_cookie(
        key="access_token",
        httponly=True,
        secure=settings.cookie_secure,
        samesite="lax",
        domain=settings.cookie_domain,
    )
    response.delete_cookie(
        key="refresh_token",
        httponly=True,
        secure=settings.cookie_secure,
        samesite="lax",
        domain=settings.cookie_domain,
    )
    return {"message": "Successfully logged out"}


@router.post("/refresh", response_model=LoginResponse)
async def refresh_token(
    request: Request, response: Response, session: SessionDep
) -> LoginResponse:
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token not found"
        )

    payload = decode_token(token)
    if not payload or payload.type != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token"
        )

    email = payload.sub
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload"
        )

    user = get_user_by_email(session, email)
    if (
        not user
        or not user.refresh_token
        or not verify_password(token, user.refresh_token)
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user or refresh token",
        )

    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    new_access_token = create_access_token(
        subject=user.email, expires_delta=access_token_expires
    )

    response.set_cookie(
        key="access_token",
        value=new_access_token,
        httponly=True,
        secure=settings.cookie_secure,
        samesite="lax",
        max_age=int(access_token_expires.total_seconds()),
        domain=settings.cookie_domain,
    )

    return LoginResponse(
        message="Token refreshed successfully",
        user=UserPublic.model_validate(user),
    )
