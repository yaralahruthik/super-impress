from pydantic import BaseModel, EmailStr, Field
from .user import UserPublic


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)


class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserPublic


class RegisterRequest(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8, max_length=100)


class RegisterResponse(BaseModel):
    message: str
    user: UserPublic
