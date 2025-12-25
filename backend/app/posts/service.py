from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.posts.models import Post, PostCreate, PostStatus, PostUpdate


def create_post(session: Session, user_id: int, post_data: PostCreate) -> Post:
    """
    Create a new post for the given user.

    Pattern: session.add() → session.commit() → session.refresh()
    """
    db_post = Post(
        user_id=user_id,
        title=post_data.title,
        content=post_data.content,
        tags=post_data.tags,
        status=post_data.status,
    )
    session.add(db_post)
    session.commit()
    session.refresh(db_post)

    return db_post


def get_post_by_id(session: Session, post_id: int, user_id: int) -> Post:
    """
    Get a post by ID with ownership check.

    Raises:
        HTTPException: 404 if post not found or user doesn't own it
    """
    statement = select(Post).where(Post.id == post_id, Post.user_id == user_id)
    post = session.scalars(statement).first()

    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Post not found"
        )

    return post


def list_user_posts(
    session: Session,
    user_id: int,
    status_filter: Optional[PostStatus] = None,
    tag_filter: Optional[str] = None,
    limit: int = 100,
    offset: int = 0,
) -> tuple[list[Post], int]:
    """
    List posts for a user with optional filtering.

    Returns:
        Tuple of (posts, total_count)
    """
    # Base query
    statement = select(Post).where(Post.user_id == user_id)

    # Apply status filter
    if status_filter:
        statement = statement.where(Post.status == status_filter)

    # Apply tag filter (check if tag exists in array)
    if tag_filter:
        statement = statement.where(Post.tags.any(tag_filter))

    # Get total count before pagination
    count_statement = select(func.count()).select_from(statement.subquery())
    total = session.scalar(count_statement) or 0

    # Apply pagination and ordering
    statement = statement.order_by(Post.created_at.desc()).limit(limit).offset(offset)

    posts = list(session.scalars(statement).all())

    return posts, total


def update_post(
    session: Session, post_id: int, user_id: int, update_data: PostUpdate
) -> Post:
    """
    Update a post with ownership check.

    Pattern: Load tracked object → modify attributes → session.commit()

    Raises:
        HTTPException: 404 if post not found or user doesn't own it
    """
    # Get post with ownership check (raises 404 if not found)
    post = get_post_by_id(session, post_id, user_id)

    # Update only provided fields
    update_dict = update_data.model_dump(exclude_unset=True)
    for field, value in update_dict.items():
        setattr(post, field, value)

    # Commit changes (updated_at will auto-update via onupdate)
    session.commit()
    session.refresh(post)

    return post


def delete_post(session: Session, post_id: int, user_id: int) -> None:
    """
    Delete a post with ownership check.

    Pattern: Load object → session.delete() → session.commit()

    Raises:
        HTTPException: 404 if post not found or user doesn't own it
    """
    # Get post with ownership check (raises 404 if not found)
    post = get_post_by_id(session, post_id, user_id)

    session.delete(post)
    session.commit()
