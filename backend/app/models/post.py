from datetime import datetime
from sqlmodel import Field, SQLModel
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    pass


class PostBase(SQLModel):
    title: str = Field(default="Untitled")
    content: str


class Post(PostBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    published_at: datetime | None = Field(default=None)


class PostCreate(PostBase):
    """Schema for creating a post"""

    title: str = Field(min_length=1, max_length=200)
    content: str = Field(min_length=1, max_length=10000)


class PostPublic(PostBase):
    """Schema for returning a post"""

    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    published_at: datetime | None
