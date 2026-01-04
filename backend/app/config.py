from typing import ClassVar

from pydantic import Field, field_validator
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

    @field_validator("db_url")
    @classmethod
    def resolve_localhost(cls, v: str) -> str:
        from sqlalchemy.engine.url import make_url

        url = make_url(v)
        if url.host == "localhost":
            return url.set(host="127.0.0.1").render_as_string(hide_password=False)
        return v


settings = Settings()
