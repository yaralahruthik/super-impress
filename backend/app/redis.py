"""Redis client configuration and connection management.

Provides a singleton Redis client for OAuth state tokens and caching.

See: decisions/tech/14-oauth-flow-implementation.md
"""

from typing import Annotated

from fastapi import Depends
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict
from redis import Redis


class RedisSettings(BaseSettings):
    """Redis connection settings."""

    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore"
    )

    host: str = Field(default="localhost", alias="REDIS_HOST")
    port: int = Field(default=6379, alias="REDIS_PORT")
    db: int = Field(default=0, alias="REDIS_DB")
    password: str | None = Field(default=None, alias="REDIS_PASSWORD")
    decode_responses: bool = True


redis_settings = RedisSettings()

_redis_client: Redis | None = None


def get_redis() -> Redis:
    """Get or create Redis client singleton."""
    global _redis_client
    if _redis_client is None:
        _redis_client = Redis(
            host=redis_settings.host,
            port=redis_settings.port,
            db=redis_settings.db,
            password=redis_settings.password,
            decode_responses=redis_settings.decode_responses,
        )
    return _redis_client


RedisDep = Annotated[Redis, Depends(get_redis)]
