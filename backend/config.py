from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator, model_validator
from typing import List, Any
import json


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", 
        env_file_encoding="utf-8",
        # Disable automatic JSON parsing for complex types
        env_parse_none_str=None
    )
    
    # Database
    DATABASE_URL: str = "sqlite:///./quickpoll.db"
    
    # API
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    API_RELOAD: bool = True
    
    # CORS - will be parsed from string to list
    CORS_ORIGINS: Any = ["http://localhost:3000", "http://127.0.0.1:3000"]
    
    # Environment
    ENVIRONMENT: str = "development"
    
    @field_validator('CORS_ORIGINS', mode='before')
    @classmethod
    def parse_cors_origins(cls, v) -> List[str]:
        if isinstance(v, list):
            return v
        if isinstance(v, str):
            # Handle comma-separated string
            if ',' in v:
                return [origin.strip() for origin in v.split(',')]
            # Single value
            return [v]
        return ["http://localhost:3000", "http://127.0.0.1:3000"]


settings = Settings()
