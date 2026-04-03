"""
Configuration for ThinkStream Backend
"""

from typing import Any

from pydantic import Field
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings"""
    
    # Database
    DATABASE_URL: str = "postgresql://thinkstream:thinkstream_dev_password@localhost:5432/thinkstream"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # Celery
    CELERY_BROKER_URL: str = "redis://localhost:6379/1"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/2"
    
    # Environment
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    # API
    API_V1_STR: str = "/api"
    PROJECT_NAME: str = "ThinkStream"
    
    # CORS
    ALLOWED_ORIGINS: list[str] = Field(
        default_factory=lambda: ["http://localhost:3000", "http://localhost:8000"]
    )

    # Ingestion
    MIN_SOURCE_QUALITY_SCORE: int = 51
    FETCH_INTERVAL_HOURS: int = 6
    ENABLE_SCHEDULER: bool = True

    # Gmail SMTP for OTP
    GMAIL_USER: str = ""
    GMAIL_APP_PASSWORD: str = ""

    @field_validator("DEBUG", mode="before")
    @classmethod
    def parse_debug(cls, value: Any) -> bool:
        if isinstance(value, bool):
            return value
        if isinstance(value, str):
            normalized = value.strip().lower()
            if normalized in {"1", "true", "yes", "on", "debug", "development"}:
                return True
            if normalized in {"0", "false", "no", "off", "release", "prod", "production"}:
                return False
        return bool(value)

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True)

settings = Settings()
