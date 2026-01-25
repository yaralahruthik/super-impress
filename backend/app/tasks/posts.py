"""Post publishing Celery tasks."""

import asyncio

from celery import Task
from sqlalchemy.orm import Session

from app.auth.models import User
from app.celery_app import app
from app.database import SessionLocal
from app.posts.models import Post, PostStatus
from app.social.linkedin.service import post_to_linkedin
from app.social.models import SocialPlatform
from app.social.service import get_connection


class DatabaseTask(Task):
    """Base task with database session management."""

    _session: Session | None = None

    @property
    def session(self) -> Session:
        if self._session is None:
            self._session = SessionLocal()
        return self._session

    def after_return(self, *args, **kwargs):
        if self._session is not None:
            self._session.close()
            self._session = None


@app.task(
    base=DatabaseTask,
    bind=True,
    max_retries=3,
    autoretry_for=(Exception,),
    retry_backoff=True,
    retry_backoff_max=300,
    retry_jitter=True,
    name="posts.publish_scheduled_post",
)
def publish_scheduled_post(self: DatabaseTask, post_id: int) -> dict:
    """Publish a scheduled post to LinkedIn."""
    session = self.session

    try:
        post = session.get(Post, post_id)
        if not post:
            return {"status": "not_found"}

        if post.status != PostStatus.SCHEDULED:
            return {"status": "skipped", "reason": f"status_{post.status}"}

        user = session.get(User, post.user_id)
        if not user:
            _mark_post_failed(session, post, "User not found")
            return {"status": "failed", "reason": "user_not_found"}

        linkedin_conn = get_connection(session, user, SocialPlatform.LINKEDIN)
        if not linkedin_conn:
            _mark_post_failed(session, post, "LinkedIn account not connected")
            return {"status": "failed", "reason": "no_connection"}

        linkedin_post_id = asyncio.run(post_to_linkedin(session, user, post))

        return {"status": "success", "platform_post_id": linkedin_post_id}

    except Exception as exc:
        if self.request.retries >= self.max_retries:
            post = session.get(Post, post_id)
            if post:
                _mark_post_failed(session, post, str(exc))

        raise


def _mark_post_failed(session: Session, post: Post, reason: str) -> None:
    post.status = PostStatus.FAILED
    post.reason_failed = reason
    post.celery_task_id = None
    session.commit()
