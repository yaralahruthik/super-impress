from typing import ClassVar

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


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


settings = Settings()
