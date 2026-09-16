from sqlalchemy.orm import Session
from app.models.alert import Alert as DBAlert
from datetime import datetime, timezone
import json
from pathlib import Path
from app.core.config import settings

def run_alert_engine(db: Session):
    project_root = Path(settings.PROJECT_ROOT)
    data_dir = project_root / "DIMA_HASAO_LANDSLIDE_DATA"
    geojson_path = data_dir / "predictions" / "risk_map.geojson"
    
    if not geojson_path.exists():
        return
        
    with open(geojson_path, "r") as f:
        data = json.load(f)
        
    features = data.get("features", [])
    
    alerts_generated = 0
    for feature in features:
        props = feature.get("properties", {})
        risk_score = props.get("risk_score", 0)
        rainfall_24h = props.get("rainfall_24h", 0)
        cell_id = props.get("cell_id", "Unknown")
        
        level = None
        message = None
        
        if risk_score > 0.75 and rainfall_24h > 100:
            level = "HIGH_ALERT"
            message = f"Critical risk in {cell_id} due to intense rainfall ({rainfall_24h:.1f}mm) and high baseline risk."
        elif risk_score > 0.5 and rainfall_24h > 50:
            level = "ALERT"
            message = f"Elevated risk in {cell_id} (Rainfall: {rainfall_24h:.1f}mm)."
            
        if level:
            # Check if recent alert exists to avoid spam
            recent_alert = db.query(DBAlert).filter(
                DBAlert.message == message,
                DBAlert.level == level
            ).order_by(DBAlert.timestamp.desc()).first()
            
            # Simple deduplication (e.g. within last hour, but here we just check if it exists at all)
            if not recent_alert:
                count = db.query(DBAlert).count()
                new_alert = DBAlert(
                    alert_id=f"ALT-{(count + 1):03d}",
                    level=level,
                    message=message
                )
                db.add(new_alert)
                alerts_generated += 1
                
    if alerts_generated > 0:
        db.commit()
