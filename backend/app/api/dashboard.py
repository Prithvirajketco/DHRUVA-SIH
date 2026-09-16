from fastapi import APIRouter, Query
import app.services.risk_engine as risk_engine

router = APIRouter()

@router.get("/dashboard/summary")
def get_dashboard_summary():
    engine = risk_engine.engine
    if engine is None:
        return {"error": "Risk engine not initialized"}
    return engine.get_summary()

@router.get("/dashboard/hotspots")
def get_dashboard_hotspots(
    n: int = Query(10, gt=0),
    min_risk: float = Query(0.5, ge=0.0, le=1.0)
):
    engine = risk_engine.engine
    if engine is None:
        return []
    return engine.get_hotspots(n=n, min_risk_score=min_risk)
