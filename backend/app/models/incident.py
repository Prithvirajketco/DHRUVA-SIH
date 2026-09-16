from sqlalchemy import Column, Integer, String, Float, DateTime
from app.core.database import Base
from datetime import datetime, timezone

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(String, unique=True, index=True)
    location = Column(String, index=True)
    lat = Column(Float)
    lon = Column(Float)
    status = Column(String, default="NEW") # NEW, UNDER_REVIEW, VERIFIED, RESOLVED
    description = Column(String)
    reported_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
