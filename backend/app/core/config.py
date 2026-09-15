import json
from typing import List, Union
from pydantic import field_validator, model_validator
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

    # Authentication & Security
    # In development, a fallback secret key is provided. In production, this default is rejected.
    SECRET_KEY: str = "insecure-dev-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    AUTH_COOKIE_NAME: str = "portfolio_admin_token"
    COOKIE_SECURE: bool = False  # Set to True in production with HTTPS
    COOKIE_SAMESITE: str = "lax"  # "lax", "strict", or "none" (if secure)

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

    @model_validator(mode="after")
    def validate_production_security(self) -> "Settings":
        """
        Security requirement: Production MUST reject the insecure/default development SECRET_KEY.
        Never allow production deployment with the default value.
        """
        if self.ENVIRONMENT.lower() == "production":
            insecure_markers = ["insecure", "change-me", "secret-key", "default"]
            if not self.SECRET_KEY or any(m in self.SECRET_KEY.lower() for m in insecure_markers):
                raise ValueError(
                    "CRITICAL SECURITY ERROR: The default or insecure development SECRET_KEY "
                    "is strictly forbidden in production. Set a secure, random SECRET_KEY in the environment."
                )
        return self

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


# Singleton settings instance
settings = Settings()
