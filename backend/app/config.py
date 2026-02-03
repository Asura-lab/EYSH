from pydantic_settings import BaseSettings
from pathlib import Path
from functools import lru_cache


class Settings(BaseSettings):
    mongodb_url: str = "mongodb://localhost:27017"
    database_name: str = "eysh"
    secret_key: str = "your-super-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    class Config:
        env_file = str(Path(__file__).resolve().parents[1] / ".env")


@lru_cache()
def get_settings():
    return Settings()
