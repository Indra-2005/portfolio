import json
from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Application Settings configured via environment variables or .env file.
    
    Adheres to Twelve-Factor App principles: configuration is stored in the environment.
    Provides safe defaults for local development.
    """
    PROJECT_NAME: str = "Portfolio API"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"
    
    # PostgreSQL connection string
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/portfolio_db"
    
    # CORS: Allowed origins for frontend communication
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
    ]

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            v = v.strip()
            if not v:
                return []
            if v.startswith("[") and v.endswith("]"):
                try:
                    return json.loads(v)
                except Exception:
                    pass
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, (list, tuple)):
            return list(v)
        return []

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


# Singleton settings instance
settings = Settings()
