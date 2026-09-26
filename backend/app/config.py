"""
AquaShield AI — Application Configuration
Loads settings from environment variables or defaults
"""
import os
from pydantic_settings import BaseSettings
from functools import lru_cache

# Resolve the project root (two levels up from this file: backend/app/config.py -> root)
_PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
_DB_PATH = os.path.join(_PROJECT_ROOT, "aquashield.db")

class Settings(BaseSettings):
    app_name: str = "AquaShield AI"
    app_version: str = "1.0.0"
    debug: bool = True

    secret_key: str = "aquashield-secret-key-2026"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440

    database_url: str = f"sqlite+aiosqlite:///{_DB_PATH}"
    database_url_sync: str = f"sqlite:///{_DB_PATH}"

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
