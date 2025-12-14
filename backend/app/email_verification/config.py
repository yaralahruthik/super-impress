from typing import ClassVar

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class EmailSettings(BaseSettings):
    model_config: ClassVar[SettingsConfigDict] = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore"
    )
    resend_api_key: str = Field(default="", alias="RESEND_API_KEY")
    resend_from_email: str = Field(default="", alias="RESEND_FROM_EMAIL")
    app_url: str = Field(default="http://localhost:5173", alias="APP_URL")
    verification_token_expire_hours: int = Field(
        default=24, alias="VERIFICATION_TOKEN_EXPIRE_HOURS"
    )
    resend_cooldown_minutes: int = Field(default=5, alias="RESEND_COOLDOWN_MINUTES")


email_settings = EmailSettings()
