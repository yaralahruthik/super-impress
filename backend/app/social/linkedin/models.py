"""Pydantic schemas for LinkedIn integration."""

from pydantic import BaseModel


class LinkedInConnectInitiate(BaseModel):
    """Response when initiating LinkedIn OAuth flow."""

    authorization_url: str
    state: str


class LinkedInConnectCallback(BaseModel):
    """Request body for OAuth callback."""

    code: str
    state: str


class LinkedInConnectionStatus(BaseModel):
    """LinkedIn connection status for a user."""

    connected: bool
    person_urn: str | None = None
    connected_at: str | None = None
    expires_at: str | None = None


class LinkedInPostRequest(BaseModel):
    """Request to post content to LinkedIn."""

    post_id: int


class LinkedInPostResponse(BaseModel):
    """Response after posting to LinkedIn."""

    success: bool
    linkedin_post_id: str
