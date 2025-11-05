from pydantic import BaseModel, ConfigDict, EmailStr
from sqlalchemy import Integer, String
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: EmailStr


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    email: Mapped[EmailStr] = mapped_column(String, unique=True, index=True)
    password: Mapped[str] = mapped_column(String)


class UserBase(BaseModel):
    email: EmailStr


class UserCreate(UserBase):
    password: str


class UserPublic(UserBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
