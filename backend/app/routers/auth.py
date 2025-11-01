from datetime import datetime, timedelta, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request, Security, status
from fastapi.responses import RedirectResponse
from fastapi.security import (
    HTTPAuthorizationCredentials,
    HTTPBearer,
    OAuth2PasswordRequestForm,
)
from app.oauth import oauth
from app.auth import get_or_create_oauth_user

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
import secrets

bearer_scheme = HTTPBearer()
router = APIRouter(tags=["auth"])

temp_token_storage = {}


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
async def login(login_data: LoginRequest, session: SessionDep) -> LoginResponse:
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

    return LoginResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        message="Login successful",
        user=UserPublic.model_validate(user),
    )


@router.post("/login/swagger", include_in_schema=False)
async def login_for_swagger(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()], session: SessionDep
):
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


@router.post("/logout")
async def logout(user: CurrentUser, session: SessionDep):
    if user:
        user.refresh_token = None
        user.refresh_token_expires_at = None
        session.add(user)
        session.commit()

    return {"message": "Successfully logged out"}


@router.post("/refresh", response_model=LoginResponse)
async def refresh_token(
    session: SessionDep,
    token: HTTPAuthorizationCredentials = Security(bearer_scheme),
) -> LoginResponse:
    refresh_token_str = token.credentials
    if not refresh_token_str:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token not found"
        )

    payload = decode_token(refresh_token_str)
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
        or not verify_password(refresh_token_str, user.refresh_token)
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user or refresh token",
        )

    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    new_access_token = create_access_token(
        subject=user.email, expires_delta=access_token_expires
    )

    return LoginResponse(
        access_token=new_access_token,
        message="Token refreshed successfully",
        user=UserPublic.model_validate(user),
    )


@router.get("/me", response_model=UserPublic)
async def get_current_user(user: CurrentUser) -> UserPublic:
    """Get current authenticated user information"""
    return UserPublic.model_validate(user)


@router.get("/google")
async def google_login(request: Request):
    """Initiate Google OAuth flow"""
    redirect_uri = settings.google_redirect_uri
    return await oauth.google.authorize_redirect(request, redirect_uri)


@router.get("/google/callback")
async def google_callback(request: Request, session: SessionDep):
    """Handle Google OAuth callback"""
    try:
        token = await oauth.google.authorize_access_token(request)
        user_info = token.get("userinfo")

        if not user_info:
            return RedirectResponse(
                url=f"{settings.frontend_url}/login?error=no_user_info"
            )

        user = get_or_create_oauth_user(
            session=session,
            email=user_info["email"],
            name=user_info.get("name", user_info["email"]),
            oauth_provider="google",
            oauth_id=user_info["sub"],
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
        user.refresh_token_expires_at = (
            datetime.now(timezone.utc) + refresh_token_expires
        )
        session.add(user)
        session.commit()

        one_time_code = secrets.token_urlsafe(32)
        temp_token_storage[one_time_code] = {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "user": UserPublic.model_validate(user),
        }

        redirect_url = f"{settings.frontend_url}/callback/google?code={one_time_code}"
        return RedirectResponse(url=redirect_url)

    except Exception as e:
        print(f"OAuth error: {e}")
        return RedirectResponse(url=f"{settings.frontend_url}/login?error=oauth_failed")


@router.post("/google/exchange-code")
async def exchange_code_for_token(request: Request):
    data = await request.json()
    code = data.get("code")

    if not code or code not in temp_token_storage:
        raise HTTPException(status_code=400, detail="Invalid or expired code")

    tokens = temp_token_storage.pop(code)
    return tokens
