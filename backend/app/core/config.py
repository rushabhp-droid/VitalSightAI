from pydantic_settings import BaseSettings
from typing import List
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Anthropic API
    anthropic_api_key: str

    # App Configuration
    app_name: str = "VitalSightAI"
    debug: bool = False
    cors_origins: List[str] = ["http://localhost:3000"]

    # OCR Configuration
    tesseract_cmd: str = "/usr/bin/tesseract"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()