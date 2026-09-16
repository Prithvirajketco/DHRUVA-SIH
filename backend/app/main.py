from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
import os
from pathlib import Path

from app.api import risk, dashboard, alerts, incidents, ml
import app.services.risk_engine as risk_engine
from app.core.config import settings
from app.core.database import engine, Base
import app.models # ensure models are imported to be registered
app = FastAPI(
    title=settings.APP_NAME,
    description="Backend for the SIH Landslide Early-Warning System",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(risk.router, prefix="/api/v1")
app.include_router(dashboard.router, prefix="/api/v1")
app.include_router(alerts.router, prefix="/api/v1")
app.include_router(incidents.router, prefix="/api/v1")
app.include_router(ml.router, prefix="/api/v1/ml")

@app.on_event("startup")
async def startup_event():
    # Initialize Database Tables
    Base.metadata.create_all(bind=engine)
    
    # Initialize Risk Engine
    project_root = Path(settings.PROJECT_ROOT)
    data_dir = project_root / "DIMA_HASAO_LANDSLIDE_DATA"
    geojson_path = data_dir / "predictions" / "risk_map.geojson"
    summary_path = data_dir / "predictions" / "risk_summary.json"
    metadata_path = data_dir / "12_model" / "model_metadata.json"
    
    risk_engine.engine = risk_engine.RiskEngine(
        str(geojson_path),
        str(summary_path),
        str(metadata_path)
    )

@app.get("/")
def read_root():
    return RedirectResponse(url="/docs")

@app.get("/api/v1/health")
def health_check():
    engine = risk_engine.engine
    summary = engine.get_summary() if engine else {}
    return {
        "status": "ok",
        "model_version": summary.get("model_version", "unknown"),
        "prediction_timestamp": summary.get("prediction_timestamp", "unknown"),
        "total_cells": summary.get("total_cells", 0),
        "is_demo_data": summary.get("is_demo_data", True),
        "platform": settings.APP_NAME,
        "region": "Dima Hasao, Assam"
    }
