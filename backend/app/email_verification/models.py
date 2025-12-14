from pydantic import BaseModel, EmailStr


class EmailVerificationRequest(BaseModel):
    """Schema for requesting email verification resend."""

    email: EmailStr


class EmailVerificationConfirm(BaseModel):
    """Schema for confirming email verification."""

    token: str


class EmailVerificationResponse(BaseModel):
    """Schema for verification responses."""

    message: str
    email: str | None = None
