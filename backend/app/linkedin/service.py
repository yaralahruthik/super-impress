"""LinkedIn service layer for business logic."""

from datetime import datetime, timedelta

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.auth.models import User
from app.linkedin.client import create_post as create_linkedin_post
from app.linkedin.client import get_user_info
from app.linkedin.encryption import decrypt_token, encrypt_token
from app.linkedin.oauth import exchange_code_for_tokens, refresh_access_token
from app.posts.models import Post


async def connect_linkedin(session: Session, user: User, code: str) -> User:
    """Complete LinkedIn OAuth flow and store refresh token."""
    # Exchange code for tokens
    token_data = await exchange_code_for_tokens(code)

    access_token = token_data["access_token"]
    refresh_token = token_data.get("refresh_token")
    refresh_token_expires_in = token_data.get("refresh_token_expires_in", 31536000)

    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="LinkedIn did not provide a refresh token.",
        )

    # Fetch user info to get person URN
    user_info = await get_user_info(access_token)
    person_urn = user_info.get("sub")

    if not person_urn:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to retrieve LinkedIn person URN",
        )

    # Store encrypted refresh token
    user.linkedin_connected = True
    user.linkedin_person_urn = person_urn
    user.linkedin_refresh_token = encrypt_token(refresh_token)
    user.linkedin_refresh_token_expires_at = datetime.now() + timedelta(
        seconds=refresh_token_expires_in
    )
    user.linkedin_connected_at = datetime.now()

    session.commit()
    session.refresh(user)

    return user


async def disconnect_linkedin(session: Session, user: User) -> User:
    """Disconnect LinkedIn account and clear tokens."""
    user.linkedin_connected = False
    user.linkedin_person_urn = None
    user.linkedin_refresh_token = None
    user.linkedin_refresh_token_expires_at = None
    user.linkedin_connected_at = None

    session.commit()
    session.refresh(user)

    return user


async def get_fresh_access_token(user: User) -> str:
    """Get a fresh access token using stored refresh token."""
    if not user.linkedin_connected or not user.linkedin_refresh_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="LinkedIn account not connected",
        )

    # Check if refresh token is expired
    if (
        user.linkedin_refresh_token_expires_at
        and user.linkedin_refresh_token_expires_at < datetime.now()
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="LinkedIn refresh token expired. Please reconnect your account.",
        )

    # Decrypt and use refresh token
    refresh_token = decrypt_token(user.linkedin_refresh_token)
    token_data = await refresh_access_token(refresh_token)

    return token_data["access_token"]


async def post_to_linkedin(session: Session, user: User, post: Post) -> str:
    """Post content to LinkedIn on behalf of user."""
    if not user.linkedin_connected or not user.linkedin_person_urn:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="LinkedIn account not connected",
        )

    # Get fresh access token
    access_token = await get_fresh_access_token(user)

    # Create LinkedIn post (use only content, ignore title)
    linkedin_post_id = await create_linkedin_post(
        access_token=access_token,
        person_urn=user.linkedin_person_urn,
        content=post.content,
    )

    return linkedin_post_id
