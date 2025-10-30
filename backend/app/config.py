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
    google_client_id: str = Field(
        default="",
        alias="GOOGLE_CLIENT_ID",
        description="Google OAuth client ID",
    )
    google_client_secret: str = Field(
        default="",
        alias="GOOGLE_CLIENT_SECRET",
        description="Google OAuth client secret",
    )
    google_redirect_uri: str = Field(
        default="http://localhost:5173/callback/google",
        alias="GOOGLE_REDIRECT_URI",
        description="Google OAuth redirect URI",
    )


settings = Settings()
