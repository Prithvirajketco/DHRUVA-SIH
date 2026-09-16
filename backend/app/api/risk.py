from fastapi import APIRouter, HTTPException, Query
from typing import Optional
import app.services.risk_engine as risk_engine

router = APIRouter()

ACTIONS = {
    "Low": "No immediate action required. Stay informed.",
    "Moderate": "Monitor local advisories. Avoid unstable slopes.",
    "High": "Avoid travel near slopes. Follow authority instructions.",
    "Very High": "Evacuate if instructed. Stay away from hillsides and streams."
}

def feature_to_geojson(feature: dict) -> dict:
    return {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [feature.get("lon"), feature.get("lat")]
        },
        "properties": feature
    }

@router.get("/map/risk")
def get_risk_map(
    bbox: Optional[str] = Query(None, description="minLon,minLat,maxLon,maxLat"),
    category: Optional[int] = Query(None, ge=1, le=4),
    limit: Optional[int] = Query(None, gt=0)
):
    engine = risk_engine.engine
    if engine is None:
        return {"type": "FeatureCollection", "features": []}
    features = engine.get_all_features(bbox=bbox, risk_category=category, limit=limit)
    geojson_features = [feature_to_geojson(f) for f in features]
    return {
        "type": "FeatureCollection",
        "features": geojson_features
    }

@router.get("/map/risk/{cell_id}")
def get_cell_detail(cell_id: str):
    engine = risk_engine.engine
    if engine is None:
        raise HTTPException(status_code=503, detail="Risk engine not ready")
    feature = engine.get_cell(cell_id)
    if not feature:
        raise HTTPException(status_code=404, detail="Cell not found")
    feature = dict(feature)
    feature["recommended_action"] = ACTIONS.get(feature.get("risk_label", "Low"), "Stay informed.")
    return feature

@router.get("/locations/search")
def search_location(q: str = Query(..., description="lat,lon")):
    engine = risk_engine.engine
    if engine is None:
        raise HTTPException(status_code=503, detail="Risk engine not ready")
    try:
        lat, lon = map(float, q.split(","))
    except ValueError:
        raise HTTPException(status_code=400, detail="Query must be 'lat,lon'")
    feature = engine.get_nearest_cell(lat, lon)
    if not feature:
        raise HTTPException(status_code=404, detail="No cells found")
    feature = dict(feature)
    feature["recommended_action"] = ACTIONS.get(feature.get("risk_label", "Low"), "Stay informed.")
    return feature
