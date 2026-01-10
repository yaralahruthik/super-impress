"""Scheduled jobs for publishing posts."""

import logging
from datetime import datetime, timezone

from sqlalchemy import and_, select
from sqlalchemy.orm import Session

from app.auth.models import User
from app.database import SessionLocal
from app.posts.models import Post, PostStatus
from app.social.linkedin.service import post_to_linkedin
from app.social.models import SocialPlatform
from app.social.service import get_connection

logger = logging.getLogger(__name__)


async def publish_scheduled_posts():
    """Poll for posts that are scheduled and ready to publish."""
    logger.info("Running scheduled post publishing job")

    db = SessionLocal()
    try:
        now = datetime.now(timezone.utc)
        statement = (
            select(Post)
            .where(and_(Post.status == PostStatus.SCHEDULED, Post.scheduled_for <= now))
            .limit(50)
        )

        posts = db.scalars(statement).all()
        logger.info(f"Found {len(posts)} posts ready to publish")

        for post in posts:
            try:
                user = db.get(User, post.user_id)
                if not user:
                    logger.error(f"Post {post.id}: User {post.user_id} not found")
                    _mark_post_failed(db, post, "User not found")
                    continue

                linkedin_conn = get_connection(db, user, SocialPlatform.LINKEDIN)
                if not linkedin_conn:
                    logger.warning(f"Post {post.id}: LinkedIn not connected")
                    _mark_post_failed(db, post, "LinkedIn account not connected")
                    continue

                logger.info(f"Publishing post {post.id} to LinkedIn")
                await post_to_linkedin(db, user, post)

                logger.info(f"Successfully published post {post.id}")

            except Exception as e:
                logger.error(
                    f"Failed to publish post {post.id}: {str(e)}", exc_info=True
                )
                _mark_post_failed(db, post, str(e))

    except Exception as e:
        logger.error(f"Error in job: {str(e)}", exc_info=True)
    finally:
        db.close()


def _mark_post_failed(db: Session, post: Post, reason: str):
    """Mark a post as failed with reason."""
    post.status = PostStatus.FAILED
    post.reason_failed = reason[:5000]
    db.commit()
