from typing import ClassVar

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config: ClassVar[SettingsConfigDict] = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore"
    )
    db_url: str = Field(
        default="", alias="DATABASE_URL", description="Database connection URL"
    )
    token_encryption_key: str = Field(
        default="",
        alias="TOKEN_ENCRYPTION_KEY",
        description="Fernet key for token encryption",
    )


settings = Settings()
