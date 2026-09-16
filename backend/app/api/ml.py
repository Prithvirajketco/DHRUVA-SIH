from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from app.services.ml_engine import ml_engine_instance

router = APIRouter()

class PredictionRequest(BaseModel):
    rainfall: float
    slope: float
    soil_moisture: float
    historical_landslides: int
    ground_deformation: float

class PredictionResponse(BaseModel):
    current_risk: int
    fos: float
    temporal_projection: List[int]
    contributors: List[str]
    model_version: str

@router.post("/predict", response_model=PredictionResponse)
def predict_risk(data: PredictionRequest):
    try:
        result = ml_engine_instance.predict(data.dict())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
