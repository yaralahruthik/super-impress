from typing import ClassVar

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class AuthSettings(BaseSettings):
    model_config: ClassVar[SettingsConfigDict] = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore"
    )
    secret_key: str = Field(default="", alias="SECRET_KEY")
    algorithm: str = Field(default="", alias="ALGORITHM")
    access_token_expire_minutes: int = Field(
        default=0, alias="ACCESS_TOKEN_EXPIRE_MINUTES"
    )


auth_settings = AuthSettings()
