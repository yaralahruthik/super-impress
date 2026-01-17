"""Task scheduling and management helpers."""

from datetime import datetime, timedelta, timezone

from app.celery_app import app
from app.tasks.posts import publish_scheduled_post

MAX_SCHEDULE_DAYS = 30


def schedule_post_task(post_id: int, scheduled_for: datetime) -> str:
    now = datetime.now(timezone.utc)

    max_schedule_time = now + timedelta(days=MAX_SCHEDULE_DAYS)
    if scheduled_for > max_schedule_time:
        raise ValueError(
            f"Cannot schedule more than {MAX_SCHEDULE_DAYS} days in advance"
        )

    result = publish_scheduled_post.apply_async(
        args=[post_id],
        eta=scheduled_for,
        task_id=f"post_{post_id}_{int(scheduled_for.timestamp())}",
    )

    return result.id


def cancel_post_task(task_id: str) -> bool:
    try:
        app.control.revoke(task_id, terminate=True)
        return True
    except Exception:
        return False


def reschedule_post_task(
    old_task_id: str, post_id: int, new_scheduled_for: datetime
) -> str:
    cancel_post_task(old_task_id)
    new_task_id = schedule_post_task(post_id, new_scheduled_for)
    return new_task_id
