from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import ARRAY, DateTime, ForeignKey, String, Text, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


# Python Enum for post status
class PostStatus(str, Enum):
    """Post status enumeration."""

    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"


# SQLAlchemy ORM Model
class Post(Base):
    """Post table for user-created content."""

    __tablename__ = "post"

    # Primary key
    id: Mapped[int] = mapped_column(primary_key=True)

    # Foreign key to User (ownership)
    user_id: Mapped[int] = mapped_column(ForeignKey("user.id"), index=True)

    # Content fields
    title: Mapped[str] = mapped_column(String(255), index=True)  # Indexed for search
    content: Mapped[str] = mapped_column(Text)
    tags: Mapped[list[str]] = mapped_column(
        ARRAY(String), default=list
    )  # PostgreSQL array
    status: Mapped[PostStatus] = mapped_column(
        SQLEnum(PostStatus, name="post_status", native_enum=False),
        default=PostStatus.DRAFT,
        index=True,  # Indexed for filtering
    )

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )


# Pydantic Schemas


class PostBase(BaseModel):
    """Base post schema with common fields."""

    title: str = Field(min_length=1, max_length=255, description="Post title")
    content: str = Field(min_length=1, description="Post content")
    tags: list[str] = Field(default_factory=list, description="Post tags")


class PostCreate(PostBase):
    """Schema for creating a new post."""

    status: PostStatus = PostStatus.DRAFT  # Optional, defaults to draft


class PostUpdate(BaseModel):
    """Schema for updating a post (all fields optional)."""

    title: Optional[str] = Field(None, min_length=1, max_length=255)
    content: Optional[str] = Field(None, min_length=1)
    tags: Optional[list[str]] = None
    status: Optional[PostStatus] = None


class PostPublic(PostBase):
    """Schema for post public data."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    status: PostStatus
    created_at: datetime
    updated_at: datetime


class PostListResponse(BaseModel):
    """Response schema for listing posts."""

    posts: list[PostPublic]
    total: int
