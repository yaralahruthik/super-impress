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


settings = Settings()
