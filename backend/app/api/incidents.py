from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime, timezone
from typing import List

from app.core.database import get_db
from app.models.incident import Incident as DBIncident

router = APIRouter()

class IncidentCreate(BaseModel):
    location: str
    lat: float
    lon: float
    description: str

class IncidentResponse(BaseModel):
    id: int
    incident_id: str
    location: str
    lat: float
    lon: float
    status: str
    description: str
    reported_at: datetime

    class Config:
        from_attributes = True

@router.get("/incidents", response_model=List[IncidentResponse])
def get_incidents(db: Session = Depends(get_db)):
    return db.query(DBIncident).order_by(DBIncident.reported_at.desc()).all()

@router.post("/incidents", status_code=201, response_model=IncidentResponse)
def report_incident(incident: IncidentCreate, db: Session = Depends(get_db)):
    count = db.query(DBIncident).count()
    new_incident_id = f"INC-{(count + 1):03d}"
    
    db_incident = DBIncident(
        incident_id=new_incident_id,
        location=incident.location,
        lat=incident.lat,
        lon=incident.lon,
        status="NEW",
        description=incident.description
    )
    db.add(db_incident)
    db.commit()
    db.refresh(db_incident)
    return db_incident

@router.patch("/incidents/{incident_id}/status", response_model=IncidentResponse)
def update_incident_status(incident_id: str, status: str, db: Session = Depends(get_db)):
    db_incident = db.query(DBIncident).filter(DBIncident.incident_id == incident_id).first()
    if not db_incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    db_incident.status = status
    db.commit()
    db.refresh(db_incident)
    return db_incident
