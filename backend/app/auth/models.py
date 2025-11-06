from pydantic import BaseModel, EmailStr
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


class UserCreate(UserBase):
    """Schema for creating a new user."""

    password: str


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
