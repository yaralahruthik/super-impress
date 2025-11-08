from typing import Annotated

from pydantic import AfterValidator, BaseModel, EmailStr
from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


# SQLAlchemy ORM Model
class User(Base):
    """User table for authentication."""

    __tablename__ = "user"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String, unique=True, index=True)
    password: Mapped[str] = mapped_column(String)


# Pydantic Schemas
class UserBase(BaseModel):
    """Base user schema with common fields."""

    email: EmailStr


def password_validator(password: str) -> str:
    """Validate password strength."""
    if len(password) < 8 or len(password) > 15:
        raise ValueError("Password must be between 8 and 15 characters long")
    if not any(char.isupper() for char in password):
        raise ValueError("Password must contain at least one uppercase letter")
    if not any(char.islower() for char in password):
        raise ValueError("Password must contain at least one lowercase letter")
    if not any(char.isdigit() for char in password):
        raise ValueError("Password must contain at least one digit")
    if not any(char in "!@#$%^&*()-_=+[]{}|;:,.<>?/" for char in password):
        raise ValueError("Password must contain at least one special character")
    return password


class UserCreate(UserBase):
    """Schema for creating a new user."""

    password: Annotated[str, AfterValidator(password_validator)]


class UserPublic(UserBase):
    """Schema for user public data (excludes password)."""

    id: int

    class Config:
        from_attributes = True


class Token(BaseModel):
    """JWT token response schema."""

    access_token: str
    token_type: str


class TokenData(BaseModel):
    """Token payload data schema."""

    email: EmailStr
