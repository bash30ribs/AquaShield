"""
AquaShield AI — Application Configuration
Loads settings from environment variables or defaults
"""
from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    app_name: str = "AquaShield AI"
    app_version: str = "1.0.0"
    debug: bool = True

    secret_key: str = "aquashield-secret-key-2026"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440

    database_url: str = "sqlite+aiosqlite:///./aquashield.db"
    database_url_sync: str = "sqlite:///./aquashield.db"

    upload_dir: str = "uploads"
    max_file_size_mb: int = 50

    allowed_origins: str = "http://localhost:8000,http://127.0.0.1:8000,http://localhost:3000"

    @property
    def origins_list(self):
        return [o.strip() for o in self.allowed_origins.split(",")]

    class Config:
        env_file = ".env"
        case_sensitive = False

@lru_cache()
def get_settings() -> Settings:
    return Settings()

settings = get_settings()
