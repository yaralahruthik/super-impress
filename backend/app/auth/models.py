from typing import Annotated

from pydantic import AfterValidator, BaseModel, ConfigDict, EmailStr, Field
from sqlalchemy import String
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


class Token(BaseModel):
    """JWT token response schema."""

    access_token: str
    token_type: str


class TokenData(BaseModel):
    """Token payload data schema."""

    email: EmailStr
