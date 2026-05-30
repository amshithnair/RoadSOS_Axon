from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    PROJECT_NAME: str = "ROADSoS"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    SECRET_KEY: str = "SECRET_KEY_FOR_PROTOTYPE_CHANGE_IN_PROD"

    # DB
    DATABASE_URL: str = "postgresql+asyncpg://roadsos:roadsos@db/roadsos"

    # Redis
    REDIS_URL: str = "redis://redis:6379/0"

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = ["*"]

    class Config:
        case_sensitive = True
        env_file = ".env"


settings = Settings()
