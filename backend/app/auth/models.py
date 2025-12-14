from datetime import datetime
from typing import Annotated, Optional

from pydantic import AfterValidator, BaseModel, ConfigDict, EmailStr, Field
from sqlalchemy import Boolean, DateTime, String
from sqlalchemy.orm import Mapped, mapped_column

from app.auth.validators import password_validator
from app.database import Base


# SQLAlchemy ORM Model
class User(Base):
    """User table for authentication."""

    __tablename__ = "user"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String, unique=True, index=True)
    password: Mapped[str] = mapped_column(String)

    # Email verification fields
    email_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    verification_token: Mapped[Optional[str]] = mapped_column(
        String, nullable=True, index=True
    )
    verification_token_expires_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime, nullable=True
    )
    verification_sent_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime, nullable=True
    )
    verified_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)


# Pydantic Schemas
class UserBase(BaseModel):
    """Base user schema with common fields."""

    email: EmailStr


class UserCreate(UserBase):
    """Schema for creating a new user."""

    password: Annotated[
        str,
        Field(
            min_length=8,
            max_length=15,
            description="Must contain uppercase, lowercase, digit, and special character",
            examples=["MyP@ssw0rd"],
        ),
        AfterValidator(password_validator),
    ]


class UserPublic(UserBase):
    """Schema for user public data (excludes password)."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    email_verified: bool


class Token(BaseModel):
    """JWT token response schema."""

    access_token: str
    token_type: str


class TokenData(BaseModel):
    """Token payload data schema."""

    email: EmailStr


class PasswordChange(BaseModel):
    """Schema for changing a user's password."""

    old_password: str
    new_password: Annotated[
        str,
        Field(
            min_length=8,
            max_length=15,
            description="Must contain uppercase, lowercase, digit, and special character",
            examples=["MyNewP@ssw0rd"],
        ),
        AfterValidator(password_validator),
    ]
