"""LinkedIn OAuth 2.0 flow implementation."""

import secrets
from datetime import datetime, timedelta

import httpx
from fastapi import HTTPException, status

from app.linkedin.config import linkedin_settings

# In-memory store for OAuth state tokens (production: use Redis)
oauth_states: dict[str, datetime] = {}


def generate_oauth_state() -> str:
    """Generate CSRF protection state token."""
    state = secrets.token_urlsafe(32)
    oauth_states[state] = datetime.now() + timedelta(minutes=10)
    return state


def verify_oauth_state(state: str) -> bool:
    """Verify OAuth state token and expiry."""
    if state not in oauth_states:
        return False
    if oauth_states[state] < datetime.now():
        del oauth_states[state]
        return False
    del oauth_states[state]
    return True


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


async def refresh_access_token(refresh_token: str) -> dict:
    """Use refresh token to get a new access token."""
    async with httpx.AsyncClient() as client:
        response = await client.post(
            linkedin_settings.token_url,
            data={
                "grant_type": "refresh_token",
                "refresh_token": refresh_token,
                "client_id": linkedin_settings.client_id,
                "client_secret": linkedin_settings.client_secret,
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )

        if response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Failed to refresh access token. Please reconnect LinkedIn.",
            )

        return response.json()
