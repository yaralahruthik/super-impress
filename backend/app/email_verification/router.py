from fastapi import APIRouter, HTTPException, status

from app.auth.service import get_user_by_email
from app.database import SessionDep
from app.email_verification.config import email_settings
from app.email_verification.models import (
    EmailVerificationConfirm,
    EmailVerificationRequest,
    EmailVerificationResponse,
)
from app.email_verification.service import (
    can_resend_verification,
    create_verification_token,
    send_verification_email,
    verify_email_token,
)

email_verification_router = APIRouter(prefix="/verify", tags=["Email Verification"])


@email_verification_router.post(
    "", response_model=EmailVerificationResponse, operation_id="verify_email"
)
async def verify_email(data: EmailVerificationConfirm, session: SessionDep):
    """Verify user's email with token."""
    user = verify_email_token(session, data.token)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification token",
        )

    return EmailVerificationResponse(
        message="Email verified successfully", email=user.email
    )


@email_verification_router.post(
    "/resend",
    response_model=EmailVerificationResponse,
    operation_id="resend_verification",
)
async def resend_verification(data: EmailVerificationRequest, session: SessionDep):
    """Resend verification email."""
    user = get_user_by_email(session, data.email)

    if not user:
        return EmailVerificationResponse(
            message="If the email exists, a verification link has been sent"
        )

    if user.email_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Email already verified"
        )

    if not can_resend_verification(user):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Please wait {email_settings.resend_cooldown_minutes} minutes before requesting another verification email",
        )

    token = create_verification_token(session, user)
    send_verification_email(user.email, token)

    return EmailVerificationResponse(message="Verification email sent")
