"""LinkedIn API endpoints."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.auth.models import User
from app.auth.service import get_current_user
from app.database import SessionDep
from app.linkedin.models import (
    LinkedInConnectCallback,
    LinkedInConnectInitiate,
    LinkedInConnectionStatus,
    LinkedInPostRequest,
    LinkedInPostResponse,
)
from app.linkedin.oauth import (
    generate_oauth_state,
    get_authorization_url,
    verify_oauth_state,
)
from app.linkedin.service import (
    connect_linkedin,
    disconnect_linkedin,
    post_to_linkedin,
)
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

    return LinkedInConnectionStatus(
        connected=user.linkedin_connected,
        person_urn=user.linkedin_person_urn,
        connected_at=(
            user.linkedin_connected_at.isoformat()
            if user.linkedin_connected_at
            else None
        ),
        expires_at=(
            user.linkedin_access_token_expires_at.isoformat()
            if user.linkedin_access_token_expires_at
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
    await disconnect_linkedin(session, current_user)

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
) -> LinkedInConnectionStatus:
    """Get current LinkedIn connection status."""
    return LinkedInConnectionStatus(
        connected=current_user.linkedin_connected,
        person_urn=current_user.linkedin_person_urn,
        connected_at=(
            current_user.linkedin_connected_at.isoformat()
            if current_user.linkedin_connected_at
            else None
        ),
        expires_at=(
            current_user.linkedin_access_token_expires_at.isoformat()
            if current_user.linkedin_access_token_expires_at
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

    try:
        linkedin_post_id = await post_to_linkedin(session, current_user, post)
        return LinkedInPostResponse(
            success=True, linkedin_post_id=linkedin_post_id, error=None
        )
    except HTTPException as e:
        return LinkedInPostResponse(
            success=False, linkedin_post_id=None, error=e.detail
        )
    except Exception as e:
        return LinkedInPostResponse(success=False, linkedin_post_id=None, error=str(e))
