import secrets
from datetime import datetime, timedelta

import resend
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth.models import User
from app.email_verification.config import email_settings

resend.api_key = email_settings.resend_api_key


def generate_verification_token() -> str:
    """Generate a secure random token."""
    return secrets.token_urlsafe(32)


def send_verification_email(email: str, token: str) -> bool:
    """Send verification email using Resend."""
    verification_link = f"{email_settings.app_url}/verify-email?token={token}"

    try:
        params = {
            "from": email_settings.resend_from_email,
            "to": [email],
            "subject": "Verify your email address",
            "html": f"""
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                        .button {{
                            display: inline-block;
                            padding: 12px 24px;
                            background-color: #007bff;
                            color: white;
                            text-decoration: none;
                            border-radius: 5px;
                            margin: 20px 0;
                        }}
                        .footer {{ margin-top: 30px; font-size: 12px; color: #666; }}
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h2>Welcome! Please verify your email</h2>
                        <p>Thank you for registering. Click the button below to verify your email address:</p>
                        <a href="{verification_link}" class="button">Verify Email</a>
                        <p>Or copy and paste this link into your browser:</p>
                        <p style="word-break: break-all; color: #007bff;">{verification_link}</p>
                        <div class="footer">
                            <p>This link will expire in {email_settings.verification_token_expire_hours} hours.</p>
                            <p>If you didn't create an account, please ignore this email.</p>
                        </div>
                    </div>
                </body>
                </html>
            """,
        }

        resend.Emails.send(params)
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False


def create_verification_token(session: Session, user: User) -> str:
    """Create and store verification token for user."""
    token = generate_verification_token()
    user.verification_token = token
    user.verification_token_expires_at = datetime.utcnow() + timedelta(
        hours=email_settings.verification_token_expire_hours
    )
    user.verification_sent_at = datetime.utcnow()
    session.commit()
    return token


def verify_email_token(session: Session, token: str) -> User | None:
    """Verify token and mark email as verified."""
    statement = select(User).where(User.verification_token == token)
    user = session.scalars(statement).first()

    if not user:
        return None

    if (
        user.verification_token_expires_at
        and user.verification_token_expires_at < datetime.utcnow()
    ):
        return None

    user.email_verified = True
    user.verified_at = datetime.utcnow()
    user.verification_token = None
    user.verification_token_expires_at = None
    session.commit()

    return user


def can_resend_verification(user: User) -> bool:
    """Check if enough time has passed to resend verification email."""
    if not user.verification_sent_at:
        return True

    time_since_last = datetime.utcnow() - user.verification_sent_at
    cooldown = timedelta(minutes=email_settings.resend_cooldown_minutes)
    return time_since_last >= cooldown
