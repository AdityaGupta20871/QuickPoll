from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator
from typing import List, Any
import os


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", 
        env_file_encoding="utf-8",
        env_parse_none_str=None
    )
    
    # Database - Railway provides DATABASE_URL automatically
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./quickpoll.db")
    
    # API
    API_HOST: str = "0.0.0.0"
    API_PORT: int = int(os.getenv("PORT", 8000))
    API_RELOAD: bool = os.getenv("ENVIRONMENT", "development") == "development"
    
    # CORS - will be parsed from string to list
    CORS_ORIGINS: Any = os.getenv(
        "CORS_ORIGINS",
        "http://localhost:3000,http://127.0.0.1:3000"
    )
    
    # Environment
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    
    @field_validator('CORS_ORIGINS', mode='before')
    @classmethod
    def parse_cors_origins(cls, v) -> List[str]:
        if isinstance(v, list):
            return v
        if isinstance(v, str):
            # Handle JSON array string
            if v.startswith('['):
                import json
                try:
                    return json.loads(v)
                except:
                    pass
            # Handle comma-separated string
            if ',' in v:
                return [origin.strip() for origin in v.split(',')]
            # Single value
            return [v]
        return ["http://localhost:3000", "http://127.0.0.1:3000"]
    
    @field_validator('DATABASE_URL', mode='after')
    @classmethod
    def fix_postgres_url(cls, v: str) -> str:
        """Railway provides postgres://, but SQLAlchemy needs postgresql://"""
        if v.startswith("postgres://"):
            return v.replace("postgres://", "postgresql://", 1)
        return v


settings = Settings()
