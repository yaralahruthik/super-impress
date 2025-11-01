from datetime import datetime
from sqlmodel import SQLModel, Field
from pydantic import EmailStr


class User(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(max_length=100)
    email: EmailStr = Field(unique=True, index=True)
    password: str
    refresh_token: str | None = Field(default=None, description="Hashed refresh token")
    refresh_token_expires_at: datetime | None = Field(
        default=None, description="Expiry date of the refresh token"
    )
    oauth_provider: str | None = None
    oauth_id: str | None = None


class UserPublic(SQLModel):
    id: int
    name: str
    email: EmailStr
