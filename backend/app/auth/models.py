import re
from typing import Annotated

from pydantic import AfterValidator, BaseModel, ConfigDict, EmailStr, Field
from pydantic_core import PydanticCustomError
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
    pattern = r"^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+\[\]{}|;:,.<>?/])[A-Za-z\d!@#$%^&*()\-_=+\[\]{}|;:,.<>?/]+$"
    if not re.match(pattern, password):
        raise PydanticCustomError(
            "password_validation_error",
            "Password must contain at least one uppercase letter, lowercase letter, digit, and special character",
        )
    return password


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
