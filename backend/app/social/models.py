"""Social connection models and enums."""

from datetime import datetime
from enum import Enum
from typing import TYPE_CHECKING, Optional

from sqlalchemy import DateTime, ForeignKey, Index, JSON, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.auth.models import User


class SocialPlatform(str, Enum):
    """Supported social media platforms."""

    LINKEDIN = "linkedin"
    # Future platforms:
    # TWITTER = "twitter"
    # FACEBOOK = "facebook"
    # INSTAGRAM = "instagram"


class SocialConnection(Base):
    """Social media platform connections for users."""

    __tablename__ = "social_connection"

    # Primary key
    id: Mapped[int] = mapped_column(primary_key=True)

    # Foreign key to User
    user_id: Mapped[int] = mapped_column(
        ForeignKey("user.id", ondelete="CASCADE"), nullable=False, index=True
    )

    # Platform identification
    platform: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    platform_user_id: Mapped[str] = mapped_column(String(255), nullable=False)

    # Token storage (encrypted)
    access_token: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    access_token_expires_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime, nullable=True
    )

    # Timestamps
    connected_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)

    # Optional platform-specific data
    platform_data: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)

    # Relationship to User
    user: Mapped["User"] = relationship("User", back_populates="social_connections")

    # Constraints and indexes
    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "platform",
            "platform_user_id",
            name="uq_user_platform_account",
        ),
        Index("ix_user_platform", "user_id", "platform"),
    )

    def is_token_expired(self) -> bool:
        """Check if access token is expired."""
        if not self.access_token_expires_at:
            return False
        return self.access_token_expires_at < datetime.now()
