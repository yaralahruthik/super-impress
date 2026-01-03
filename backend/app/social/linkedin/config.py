"""LinkedIn OAuth and API configuration."""

from typing import ClassVar

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class LinkedInSettings(BaseSettings):
    """LinkedIn API and OAuth settings."""

    model_config: ClassVar[SettingsConfigDict] = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore"
    )

    client_id: str = Field(default="", alias="LINKEDIN_CLIENT_ID")
    client_secret: str = Field(default="", alias="LINKEDIN_CLIENT_SECRET")
    redirect_uri: str = Field(
        default="http://localhost:5173/linkedin/callback",
        alias="LINKEDIN_REDIRECT_URI",
    )
    token_encryption_key: str = Field(default="", alias="LINKEDIN_TOKEN_ENCRYPTION_KEY")

    # LinkedIn API URLs
    authorization_url: str = "https://www.linkedin.com/oauth/v2/authorization"
    token_url: str = "https://www.linkedin.com/oauth/v2/accessToken"
    api_base_url: str = "https://api.linkedin.com"
    api_version: str = Field(default="202511", alias="LINKEDIN_API_VERSION")

    # OAuth scopes
    scopes: list[str] = Field(default=["openid", "profile", "email", "w_member_social"])


linkedin_settings = LinkedInSettings()
