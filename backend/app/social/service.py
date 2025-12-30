"""Generic service layer for social connection operations."""

from datetime import datetime
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.auth.models import User
from app.social.models import SocialConnection, SocialPlatform


def get_connection(
    session: Session, user: User, platform: SocialPlatform
) -> Optional[SocialConnection]:
    """Get user's connection for a specific platform.

    Args:
        session: Database session
        user: User instance
        platform: Social platform enum

    Returns:
        SocialConnection if found, None otherwise
    """
    return (
        session.query(SocialConnection)
        .filter(
            SocialConnection.user_id == user.id,
            SocialConnection.platform == platform.value,
        )
        .first()
    )


def create_or_update_connection(
    session: Session,
    user: User,
    platform: SocialPlatform,
    platform_user_id: str,
    access_token: str,
    expires_at: Optional[datetime],
    platform_data: Optional[dict] = None,
) -> SocialConnection:
    """Create new connection or update existing one.

    Args:
        session: Database session
        user: User instance
        platform: Social platform enum
        platform_user_id: Platform-specific user ID
        access_token: Encrypted access token
        expires_at: Token expiration timestamp
        platform_data: Optional platform-specific data

    Returns:
        Created or updated SocialConnection instance
    """
    # Check if connection exists
    connection = (
        session.query(SocialConnection)
        .filter(
            SocialConnection.user_id == user.id,
            SocialConnection.platform == platform.value,
            SocialConnection.platform_user_id == platform_user_id,
        )
        .first()
    )

    now = datetime.now()

    if connection:
        # Update existing connection
        connection.access_token = access_token
        connection.access_token_expires_at = expires_at
        connection.updated_at = now
        if platform_data:
            connection.platform_data = platform_data
    else:
        # Create new connection
        connection = SocialConnection(
            user_id=user.id,
            platform=platform.value,
            platform_user_id=platform_user_id,
            access_token=access_token,
            access_token_expires_at=expires_at,
            connected_at=now,
            updated_at=now,
            platform_data=platform_data,
        )
        session.add(connection)

    session.commit()
    session.refresh(connection)
    return connection


def delete_connection(session: Session, user: User, platform: SocialPlatform) -> None:
    """Delete user's connection for a specific platform.

    Args:
        session: Database session
        user: User instance
        platform: Social platform enum
    """
    connection = get_connection(session, user, platform)
    if connection:
        session.delete(connection)
        session.commit()


def get_valid_access_token(connection: SocialConnection) -> str:
    """Get access token if valid, raise error if expired.

    Args:
        connection: SocialConnection instance

    Returns:
        Access token string

    Raises:
        HTTPException: If token is missing or expired
    """
    if not connection.access_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"{connection.platform.capitalize()} account not connected",
        )

    if connection.is_token_expired():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"{connection.platform.capitalize()} access token expired. Please reconnect your account.",
        )

    return connection.access_token
