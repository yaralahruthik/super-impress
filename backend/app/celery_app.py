"""Celery application configuration for Super Impress."""

from celery import Celery

from app.redis import redis_settings

app = Celery("super_impress")

app.conf.update(
    broker_url=f"redis://{redis_settings.host}:{redis_settings.port}/{redis_settings.db}",
    result_backend=f"redis://{redis_settings.host}:{redis_settings.port}/{redis_settings.db}",
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=300,
    task_soft_time_limit=240,
    result_expires=3600,
)
