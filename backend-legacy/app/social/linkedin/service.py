"""LinkedIn service layer for business logic."""

from datetime import datetime, timedelta

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.auth.models import User
from app.posts.models import Post, PostStatus
from app.social.linkedin.client import create_post as create_linkedin_post
from app.social.linkedin.client import get_user_info
from app.utils.encryption import decrypt_token, encrypt_token
from app.social.linkedin.oauth import exchange_code_for_tokens
from app.social.models import SocialPlatform
from app.social.service import (
    create_or_update_connection,
    delete_connection,
    get_connection,
    get_valid_access_token,
)


async def connect_linkedin(session: Session, user: User, code: str) -> User:
    """Complete LinkedIn OAuth flow and store access token."""
    # Exchange code for tokens
    token_data = await exchange_code_for_tokens(code)

    access_token = token_data["access_token"]
    expires_in = token_data.get("expires_in", 5184000)  # Default 60 days

    # Fetch user info to get person URN
    user_info = await get_user_info(access_token)
    person_urn = user_info.get("sub")

    if not person_urn:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to retrieve LinkedIn person URN",
        )

    # Store encrypted access token in social_connection
    create_or_update_connection(
        session=session,
        user=user,
        platform=SocialPlatform.LINKEDIN,
        platform_user_id=person_urn,
        access_token=encrypt_token(access_token),
        expires_at=datetime.now() + timedelta(seconds=expires_in),
    )

    session.refresh(user)
    return user


def disconnect_linkedin(session: Session, user: User) -> User:
    """Disconnect LinkedIn account and clear tokens."""
    delete_connection(session, user, SocialPlatform.LINKEDIN)
    session.refresh(user)
    return user


def get_access_token(session: Session, user: User) -> str:
    """Get stored access token if valid, raise error if expired."""
    linkedin_conn = get_connection(session, user, SocialPlatform.LINKEDIN)

    if not linkedin_conn:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="LinkedIn account not connected",
        )

    # Get valid token and decrypt
    encrypted_token = get_valid_access_token(linkedin_conn)
    return decrypt_token(encrypted_token)


async def post_to_linkedin(session: Session, user: User, post: Post) -> str:
    """Post content to LinkedIn on behalf of user."""
    linkedin_conn = get_connection(session, user, SocialPlatform.LINKEDIN)

    if not linkedin_conn:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="LinkedIn account not connected",
        )

    # Get access token
    access_token = get_access_token(session, user)

    try:
        linkedin_post_id = await create_linkedin_post(
            access_token=access_token,
            person_urn=linkedin_conn.platform_user_id,
            content=post.content,
        )

        post.status = PostStatus.PUBLISHED
        session.commit()
        session.refresh(post)

        return linkedin_post_id

    except Exception:
        session.rollback()
        raise
