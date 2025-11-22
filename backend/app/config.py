"""
Configuration management for FastAPI backend.
SIH25208 SAIL Bokaro Steel Plant Logistics Optimization System.
"""

from pathlib import Path
from pydantic_settings import BaseSettings
from pydantic import field_validator
from typing import Optional

class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # App settings
    APP_NAME: str = "SAIL Bokaro Logistics Optimizer"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    
    # Server settings
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    RELOAD: bool = True
    
    # Paths
    PROJECT_ROOT: Path = Path(__file__).parent.parent.parent
    BACKEND_DIR: Path = PROJECT_ROOT / "backend"
    ML_DIR: Path = BACKEND_DIR / "ml"
    MODELS_DIR: Path = ML_DIR / "models"
    SYNTHETIC_DIR: Path = ML_DIR / "synthetic"
    SYNTHETIC_RAW_DIR: Path = SYNTHETIC_DIR / "raw"
    LOGS_DIR: Path = PROJECT_ROOT / "logs"
    
    # Model paths
    DEMAND_MODEL_PATH: Path = MODELS_DIR / "demand_model.pkl"
    RAKE_AVAILABILITY_MODEL_PATH: Path = MODELS_DIR / "rake_availability_model.pkl"
    DELAY_CLASSIFIER_MODEL_PATH: Path = MODELS_DIR / "delay_classifier.pkl"
    DELAY_REGRESSOR_MODEL_PATH: Path = MODELS_DIR / "delay_regressor.pkl"
    THROUGHPUT_MODEL_PATH: Path = MODELS_DIR / "throughput_model.pkl"
    COST_MODEL_PATH: Path = MODELS_DIR / "cost_model.pkl"
    MODE_CLASSIFIER_MODEL_PATH: Path = MODELS_DIR / "mode_classifier.pkl"
    
    # CORS settings
    CORS_ORIGINS: list = ["http://localhost:3000", "http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176", "http://localhost:5177", "http://localhost:8080", "http://127.0.0.1:3000", "http://127.0.0.1:5173", "http://127.0.0.1:5174", "http://127.0.0.1:5175", "http://127.0.0.1:5176", "http://127.0.0.1:5177", "https://sail-bokaro-frontend.vercel.app"]
    CORS_CREDENTIALS: bool = True
    CORS_METHODS: list = ["*"]
    CORS_HEADERS: list = ["*"]
    
    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v):
        """Parse CORS_ORIGINS from string to list."""
        if isinstance(v, list):
            return v
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",")]
        return v
    
    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    
    # API settings
    API_TIMEOUT: int = 30
    MAX_UPLOAD_SIZE: int = 100 * 1024 * 1024  # 100 MB
    
    # Optimizer settings
    OPTIMIZER_TIME_LIMIT: int = 20  # Seconds
    OPTIMIZER_RANDOM_SEED: int = 42
    
    # Database settings
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/sihdb"
    DB_POOL_SIZE: int = 10
    DB_MAX_OVERFLOW: int = 20
    USE_CSV_MODE: bool = False  # Set to True to use CSV files instead of database
    
    # Security
    ADMIN_TOKEN: str = "sail-bokaro-admin-token-secret"  # Override with env var
    
    # Request limits
    MAX_ORDERS_PER_REQUEST: int = 100
    MAX_REQUEST_SIZE_MB: int = 10
    
    # Domain constants
    MATERIALS: list = ['HR_Coils', 'CR_Coils', 'Plates', 'Wire_Rods', 'TMT_Bars', 'Pig_Iron', 'Billets']
    DESTINATIONS: list = ['Kolkata', 'Patna', 'Ranchi', 'Durgapur', 'Haldia']
    LOADING_POINTS: list = ['LP1', 'LP2', 'LP3']
    TRANSPORT_MODES: list = ['RAIL', 'ROAD']
    PRIORITIES: list = ['HIGH', 'MEDIUM', 'LOW']
    
    # Operational constraints
    MIN_RAKE_SIZE_WAGONS: int = 58
    MAX_RAKE_SIZE_WAGONS: int = 59
    WAGON_CAPACITY_TONNES: float = 63.0
    TRUCK_CAPACITY_TONNES: float = 22.0
    
    # Performance thresholds
    DEMAND_MAE_THRESHOLD: float = 500
    DEMAND_RMSE_THRESHOLD: float = 800
    RAKE_AVAILABILITY_MAE_THRESHOLD: float = 1.5
    DELAY_ACCURACY_THRESHOLD: float = 0.70
    THROUGHPUT_MAE_THRESHOLD: float = 150
    COST_MAE_THRESHOLD: float = 50000
    MODE_ACCURACY_THRESHOLD: float = 0.85
    
    class Config:
        env_file = ".env"
        case_sensitive = True

# Global settings instance
settings = Settings()

# Ensure directories exist
settings.LOGS_DIR.mkdir(parents=True, exist_ok=True)
settings.MODELS_DIR.mkdir(parents=True, exist_ok=True)
