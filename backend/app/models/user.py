from sqlmodel import SQLModel, Field
from pydantic import EmailStr


class User(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(max_length=100)
    email: EmailStr = Field(unique=True, index=True)
    password: str


class UserPublic(SQLModel):
    id: int
    name: str
    email: EmailStr
