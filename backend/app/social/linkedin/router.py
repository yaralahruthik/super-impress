"""LinkedIn API endpoints."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.auth.models import User
from app.auth.service import get_current_user
from app.database import SessionDep
from app.social.linkedin.models import (
    LinkedInConnectCallback,
    LinkedInConnectInitiate,
    LinkedInConnectionStatus,
    LinkedInPostRequest,
    LinkedInPostResponse,
)
from app.social.linkedin.oauth import (
    generate_oauth_state,
    get_authorization_url,
    verify_oauth_state,
)
from app.social.linkedin.service import (
    connect_linkedin,
    disconnect_linkedin,
    post_to_linkedin,
)
from app.social.models import SocialPlatform
from app.social.service import get_connection
from app.posts.service import get_post_by_id

linkedin_router = APIRouter(prefix="/linkedin", tags=["linkedin"])


@linkedin_router.post(
    "/connect/initiate",
    response_model=LinkedInConnectInitiate,
    operation_id="initiate_linkedin_connection",
)
async def initiate_linkedin_connection(
    current_user: Annotated[User, Depends(get_current_user)],
) -> LinkedInConnectInitiate:
    """Initiate LinkedIn OAuth flow."""
    state = generate_oauth_state()
    auth_url = get_authorization_url(state)

    return LinkedInConnectInitiate(authorization_url=auth_url, state=state)


@linkedin_router.post(
    "/connect/callback",
    response_model=LinkedInConnectionStatus,
    operation_id="complete_linkedin_connection",
)
async def complete_linkedin_connection(
    callback_data: LinkedInConnectCallback,
    current_user: Annotated[User, Depends(get_current_user)],
    session: SessionDep,
) -> LinkedInConnectionStatus:
    """Complete LinkedIn OAuth flow and store connection."""
    # Verify state token (CSRF protection)
    if not verify_oauth_state(callback_data.state):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired state token",
        )

    # Connect LinkedIn account
    user = await connect_linkedin(session, current_user, callback_data.code)

    # Get connection details
    linkedin_conn = get_connection(session, user, SocialPlatform.LINKEDIN)

    return LinkedInConnectionStatus(
        connected=linkedin_conn is not None,
        person_urn=linkedin_conn.platform_user_id if linkedin_conn else None,
        connected_at=(
            linkedin_conn.connected_at.isoformat() if linkedin_conn else None
        ),
        expires_at=(
            linkedin_conn.access_token_expires_at.isoformat()
            if linkedin_conn and linkedin_conn.access_token_expires_at
            else None
        ),
    )


@linkedin_router.post(
    "/disconnect",
    response_model=LinkedInConnectionStatus,
    operation_id="disconnect_linkedin",
)
async def disconnect_linkedin_account(
    current_user: Annotated[User, Depends(get_current_user)],
    session: SessionDep,
) -> LinkedInConnectionStatus:
    """Disconnect LinkedIn account."""
    disconnect_linkedin(session, current_user)

    return LinkedInConnectionStatus(
        connected=False,
        person_urn=None,
        connected_at=None,
        expires_at=None,
    )


@linkedin_router.get(
    "/status",
    response_model=LinkedInConnectionStatus,
    operation_id="get_linkedin_status",
)
async def get_linkedin_connection_status(
    current_user: Annotated[User, Depends(get_current_user)],
    session: SessionDep,
) -> LinkedInConnectionStatus:
    """Get current LinkedIn connection status."""
    linkedin_conn = get_connection(session, current_user, SocialPlatform.LINKEDIN)

    if not linkedin_conn:
        return LinkedInConnectionStatus(
            connected=False,
            person_urn=None,
            connected_at=None,
            expires_at=None,
        )

    return LinkedInConnectionStatus(
        connected=True,
        person_urn=linkedin_conn.platform_user_id,
        connected_at=linkedin_conn.connected_at.isoformat(),
        expires_at=(
            linkedin_conn.access_token_expires_at.isoformat()
            if linkedin_conn.access_token_expires_at
            else None
        ),
    )


@linkedin_router.post(
    "/post",
    response_model=LinkedInPostResponse,
    operation_id="post_to_linkedin",
)
async def post_to_linkedin_endpoint(
    post_request: LinkedInPostRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    session: SessionDep,
) -> LinkedInPostResponse:
    """Post content to LinkedIn."""
    # Verify user owns the post
    post = get_post_by_id(session, post_request.post_id, current_user.id)

    linkedin_post_id = await post_to_linkedin(session, current_user, post)
    return LinkedInPostResponse(
        success=True, linkedin_post_id=linkedin_post_id, error=None
    )
