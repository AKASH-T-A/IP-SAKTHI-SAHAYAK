"""
IP-SAKTI Backend — Application Settings
Uses pydantic-settings for type-safe env loading.
"""
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # App
    app_env: str = "development"
    frontend_url: str = "http://localhost:3000"
    cors_origins: List[str] = ["http://localhost:3000"]

    # Database
    database_url: str = "postgresql+asyncpg://postgres:password@localhost:5432/ipsakti"

    # JWT
    secret_key: str = "CHANGE-THIS-SECRET-KEY-BEFORE-PRODUCTION"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 15
    refresh_token_expire_days: int = 7

    # OpenAI
    openai_api_key: str = ""

    # Google Gemini
    gemini_api_key: str = ""
    gemini_model: str = "gemini-2.5-flash"
    gemini_live_model: str = "gemini-2.0-flash"

    # Storage
    storage_endpoint: str = ""
    storage_bucket: str = "ipsakti-documents"
    storage_access_key: str = ""
    storage_secret_key: str = ""

    # Admin seed
    first_admin_email: str = "admin@ipsakti.in"
    first_admin_password: str = "Admin@12345"


settings = Settings()
