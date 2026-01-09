"""APScheduler configuration and lifecycle management."""

import logging

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger

logger = logging.getLogger(__name__)

scheduler = AsyncIOScheduler()


def start_scheduler():
    """Start the scheduler and register jobs."""
    from app.scheduler.jobs import publish_scheduled_posts

    scheduler.add_job(
        publish_scheduled_posts,
        trigger=IntervalTrigger(minutes=1),
        id="publish_scheduled_posts",
        name="Publish scheduled LinkedIn posts",
        replace_existing=True,
        max_instances=1,
    )

    scheduler.start()
    logger.info("Scheduler started successfully")


def shutdown_scheduler():
    """Gracefully shutdown the scheduler."""
    scheduler.shutdown(wait=True)
    logger.info("Scheduler shut down successfully")
