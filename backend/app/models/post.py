from datetime import datetime
from sqlmodel import Field, SQLModel


class Post(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    title: str = Field(default="Untitled")
    content: str
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    published_at: datetime | None = Field(default=None)
