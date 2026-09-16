from sqlalchemy import Column, Integer, String, DateTime
from app.core.database import Base
from datetime import datetime, timezone

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    alert_id = Column(String, unique=True, index=True)
    level = Column(String) # WATCH, ALERT, HIGH_ALERT
    message = Column(String)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))
