from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime
from typing import List

from app.core.database import get_db
from app.models.alert import Alert as DBAlert
from app.services.alert_engine import run_alert_engine

router = APIRouter()

class AlertResponse(BaseModel):
    id: int
    alert_id: str
    level: str
    message: str
    timestamp: datetime

    class Config:
        from_attributes = True

@router.get("/alerts", response_model=List[AlertResponse])
def get_alerts(db: Session = Depends(get_db)):
    # Run the engine to generate any new alerts based on current risk map
    run_alert_engine(db)
    
    # Return all alerts sorted by newest
    return db.query(DBAlert).order_by(DBAlert.timestamp.desc()).all()
