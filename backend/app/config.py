"""
Configuration Management for IntentForge Backend
Centralized configuration with environment variable support
"""

from pydantic_settings import BaseSettings
from typing import Optional
import os


class Settings(BaseSettings):
    """
    Application settings with environment variable support
    """
    # Application Info
    APP_NAME: str = "IntentForge Backend"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    # API Configuration
    API_V1_PREFIX: str = "/api/v1"
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # CORS Configuration
    CORS_ORIGINS: list = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
    ]
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    
    # Database (Mock for demo)
    DB_MOCK: bool = True
    
    # AI/ML Configuration
    AI_MODEL_PATH: Optional[str] = None
    AI_TIMEOUT_MS: int = 100
    ML_CONFIDENCE_THRESHOLD: float = 0.75
    
    # Transaction Validation
    MAX_TRANSACTION_AMOUNT: float = 1000000.0
    VALIDATION_TIMEOUT_MS: int = 50
    
    # Clawback Configuration
    CLAWBACK_WINDOW_HOURS: int = 24
    AUTO_CLAWBACK_ENABLED: bool = True
    
    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FILE: str = "intentforge.log"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Global settings instance
settings = Settings()
