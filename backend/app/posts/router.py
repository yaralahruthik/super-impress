from datetime import datetime
from typing import Annotated, Optional

from fastapi import APIRouter, Depends, Query, status
from pydantic import BaseModel, Field

from app.auth.models import User
from app.auth.service import get_current_user
from app.database import SessionDep
from app.posts.models import (
    PostCreate,
    PostListResponse,
    PostPublic,
    PostStatus,
    PostUpdate,
)
from app.posts.service import (
    cancel_schedule,
    create_post,
    delete_post,
    get_post_by_id,
    list_user_posts,
    reschedule_post,
    schedule_post,
    update_post,
)

posts_router = APIRouter(prefix="/posts", tags=["Posts"])


class SchedulePostRequest(BaseModel):
    """Request to schedule a post."""

    scheduled_for: datetime = Field(description="When to publish (UTC)")


@posts_router.post(
    "",
    response_model=PostPublic,
    status_code=status.HTTP_201_CREATED,
    operation_id="create_post",
)
async def create_post_endpoint(
    post_data: PostCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    session: SessionDep,
) -> PostPublic:
    """Create a new post for the authenticated user."""
    db_post = create_post(session, current_user.id, post_data)
    return PostPublic.model_validate(db_post)


@posts_router.get(
    "",
    response_model=PostListResponse,
    operation_id="list_posts",
)
async def list_posts_endpoint(
    current_user: Annotated[User, Depends(get_current_user)],
    session: SessionDep,
    status: Optional[PostStatus] = Query(None, description="Filter by post status"),
    tag: Optional[str] = Query(None, description="Filter by tag"),
    limit: int = Query(100, ge=1, le=100, description="Number of posts to return"),
    offset: int = Query(0, ge=0, description="Number of posts to skip"),
) -> PostListResponse:
    """List posts for the authenticated user with optional filters."""
    posts, total = list_user_posts(
        session,
        current_user.id,
        status_filter=status,
        tag_filter=tag,
        limit=limit,
        offset=offset,
    )
    return PostListResponse(
        posts=[PostPublic.model_validate(post) for post in posts], total=total
    )


@posts_router.get(
    "/{post_id}",
    response_model=PostPublic,
    operation_id="get_post",
)
async def get_post_endpoint(
    post_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    session: SessionDep,
) -> PostPublic:
    """Get a specific post by ID."""
    db_post = get_post_by_id(session, post_id, current_user.id)
    return PostPublic.model_validate(db_post)


@posts_router.patch(
    "/{post_id}",
    response_model=PostPublic,
    operation_id="update_post",
)
async def update_post_endpoint(
    post_id: int,
    update_data: PostUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    session: SessionDep,
) -> PostPublic:
    """Update a specific post."""
    db_post = update_post(session, post_id, current_user.id, update_data)
    return PostPublic.model_validate(db_post)


@posts_router.delete(
    "/{post_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    operation_id="delete_post",
)
async def delete_post_endpoint(
    post_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    session: SessionDep,
) -> None:
    """Delete a specific post."""
    delete_post(session, post_id, current_user.id)


@posts_router.post(
    "/{post_id}/schedule",
    response_model=PostPublic,
    operation_id="schedule_post",
)
async def schedule_post_endpoint(
    post_id: int,
    request: SchedulePostRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    session: SessionDep,
) -> PostPublic:
    """Schedule a post for future publishing."""
    db_post = schedule_post(session, post_id, current_user.id, request.scheduled_for)
    return PostPublic.model_validate(db_post)


@posts_router.post(
    "/{post_id}/cancel-schedule",
    response_model=PostPublic,
    operation_id="cancel_schedule",
)
async def cancel_schedule_endpoint(
    post_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    session: SessionDep,
) -> PostPublic:
    """Cancel a scheduled post."""
    db_post = cancel_schedule(session, post_id, current_user.id)
    return PostPublic.model_validate(db_post)


@posts_router.post(
    "/{post_id}/reschedule",
    response_model=PostPublic,
    operation_id="reschedule_post",
)
async def reschedule_post_endpoint(
    post_id: int,
    request: SchedulePostRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    session: SessionDep,
) -> PostPublic:
    """Reschedule a post."""
    db_post = reschedule_post(session, post_id, current_user.id, request.scheduled_for)
    return PostPublic.model_validate(db_post)
