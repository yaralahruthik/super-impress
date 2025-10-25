from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field
from typing import ClassVar


class Settings(BaseSettings):
    model_config: ClassVar[SettingsConfigDict] = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8"
    )
    db_url: str = Field(
        default="", alias="DATABASE_URL", description="Database connection URL"
    )
    secret_key: str = Field(default="", alias="SECRET_KEY")
    algorithm: str = Field(default="", alias="ALGORITHM")
    access_token_expire_minutes: int = Field(
        default=0, alias="ACCESS_TOKEN_EXPIRE_MINUTES"
    )
    refresh_token_expire_minutes: int = Field(
        default=10080,
        alias="REFRESH_TOKEN_EXPIRE_MINUTES",  # 7 days
    )
    frontend_url: str = Field(
        default="http://localhost:5173",
        alias="FRONTEND_URL",
        description="Frontend URL for CORS",
    )
    cookie_domain: str | None = Field(
        default=None,
        alias="COOKIE_DOMAIN",
        description="Cookie domain (None for same-origin)",
    )
    cookie_secure: bool = Field(
        default=False,
        alias="COOKIE_SECURE",
        description="Use secure cookies (HTTPS only)",
    )


settings = Settings()
