"""LinkedIn OAuth 2.0 flow implementation."""

import secrets

import httpx
from fastapi import HTTPException, status

from app.redis import get_redis
from app.social.linkedin.config import linkedin_settings

# OAuth state expiration (10 minutes)
OAUTH_STATE_TTL = 600


def generate_oauth_state() -> str:
    """Generate CSRF protection state token and store in Redis."""
    state = secrets.token_urlsafe(32)
    redis = get_redis()
    redis.setex(f"oauth_state:{state}", OAUTH_STATE_TTL, "1")
    return state


def verify_oauth_state(state: str) -> bool:
    """Verify OAuth state token exists in Redis and delete it."""
    redis = get_redis()
    key = f"oauth_state:{state}"
    exists = redis.exists(key)
    if exists:
        redis.delete(key)
        return True
    return False


def get_authorization_url(state: str) -> str:
    """Generate LinkedIn OAuth authorization URL."""
    params = {
        "response_type": "code",
        "client_id": linkedin_settings.client_id,
        "redirect_uri": linkedin_settings.redirect_uri,
        "state": state,
        "scope": " ".join(linkedin_settings.scopes),
    }
    query_string = "&".join(f"{k}={v}" for k, v in params.items())
    return f"{linkedin_settings.authorization_url}?{query_string}"


async def exchange_code_for_tokens(code: str) -> dict:
    """Exchange authorization code for access + refresh tokens."""
    async with httpx.AsyncClient() as client:
        response = await client.post(
            linkedin_settings.token_url,
            data={
                "grant_type": "authorization_code",
                "code": code,
                "client_id": linkedin_settings.client_id,
                "client_secret": linkedin_settings.client_secret,
                "redirect_uri": linkedin_settings.redirect_uri,
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )

        if response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to exchange authorization code",
            )

        return response.json()
