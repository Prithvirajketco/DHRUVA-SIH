import os
import yaml
from pydantic_settings import BaseSettings
from pathlib import Path
from pydantic import BaseModel
from typing import Optional, Dict, Any

class Settings(BaseSettings):
    PROJECT_ROOT: str = os.getenv("PROJECT_ROOT", str(Path(__file__).resolve().parent.parent.parent.parent))
    APP_NAME: str = "SIH Landslide Early-Warning Platform"

    class Config:
        env_file = ".env"

settings = Settings()

def load_yaml(file_path: str, default: dict) -> dict:
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return yaml.safe_load(f) or default
    except FileNotFoundError:
        return default

# Load configuration dynamically
THRESHOLDS_PATH = Path(settings.PROJECT_ROOT) / "config" / "thresholds.yaml"
FACTORS_PATH = Path(settings.PROJECT_ROOT) / "config" / "factors.yaml"
STUDY_AREA_PATH = Path(settings.PROJECT_ROOT) / "config" / "study_area.yaml"

thresholds = load_yaml(str(THRESHOLDS_PATH), {})
factors = load_yaml(str(FACTORS_PATH), {})
study_area = load_yaml(str(STUDY_AREA_PATH), {})
