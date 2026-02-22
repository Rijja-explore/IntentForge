"""
Configuration Management for IntentForge Backend
Centralized configuration with environment variable support
"""

from pydantic_settings import BaseSettings
from pydantic import field_validator
from typing import Optional, Union
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
    CORS_ORIGINS: Union[list, str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
    ]
    
    @field_validator('CORS_ORIGINS', mode='before')
    @classmethod
    def parse_cors_origins(cls, v):
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(',')]
        return v
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    
    # Database (Mock for demo)
    DB_MOCK: bool = True
    
    # AI/ML Configuration
    AI_MODEL_PATH: Optional[str] = None
    AI_TIMEOUT_MS: int = 100
    ML_CONFIDENCE_THRESHOLD: float = 0.75

    # ML Model Configuration
    ML_MODELS_DIR: str = "models"
    ML_DATASETS_DIR: str = "dataset"
    ML_FRAUD_MODEL_PATH: str = "models/fraud_rf_model.joblib"
    ML_ANOMALY_MODEL_PATH: str = "models/anomaly_iso_forest.joblib"
    ML_SCALER_PATH: str = "models/feature_scaler.joblib"
    ML_LABEL_ENCODER_PATH: str = "models/label_encoder.joblib"
    ML_MODEL_VERSION: str = "ml_v1.0"
    ML_RETRAIN_ON_STARTUP: bool = False
    ML_FRAUD_THRESHOLD: float = 0.35
    ML_ANOMALY_CONTAMINATION: float = 0.05
    
    # Transaction Validation
    MAX_TRANSACTION_AMOUNT: float = 1000000.0
    VALIDATION_TIMEOUT_MS: int = 50
    
    # Clawback Configuration
    CLAWBACK_WINDOW_HOURS: int = 24
    AUTO_CLAWBACK_ENABLED: bool = True

    # Blockchain Integration
    BLOCKCHAIN_API_URL: str = "http://localhost:3001/api/v1/blockchain"
    BLOCKCHAIN_API_KEY: str = "intentforge-internal"

    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FILE: str = "intentforge.log"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Global settings instance
settings = Settings()
