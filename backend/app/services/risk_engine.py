import os
import json
import math
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Dict, Any, Optional

from app.core.config import settings

class RiskEngine:
    def __init__(self, geojson_path: str, summary_path: str, metadata_path: str):
        self.geojson_path = Path(geojson_path)
        self.summary_path = Path(summary_path)
        self.metadata_path = Path(metadata_path)
        
        self.features = []
        self.summary = {}
        self.metadata = {}
        self.is_demo_data = False
        self.load_data()

    def load_data(self):
        try:
            with open(self.metadata_path, 'r', encoding='utf-8') as f:
                self.metadata = json.load(f)
        except Exception:
            self.metadata = {
                "model_version": "rf-v1",
                "prediction_timestamp": datetime.now(timezone.utc).isoformat()
            }

        try:
            with open(self.summary_path, 'r', encoding='utf-8') as f:
                self.summary = json.load(f)
        except Exception:
            self.summary = {}

        try:
            with open(self.geojson_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                self.features = [feat["properties"] for feat in data.get("features", [])]
        except Exception:
            self.is_demo_data = True
            self.generate_mock_data()

    def generate_mock_data(self):
        self.features = []
        base_lat = 25.41
        base_lon = 93.12
        for i in range(100):
            risk_score = (i % 100) / 100.0
            category = 4 if risk_score > 0.85 else 3 if risk_score > 0.7 else 2 if risk_score > 0.5 else 1
            labels = {1: "Low", 2: "Moderate", 3: "High", 4: "Very High"}
            self.features.append({
                "cell_id": f"dh_0_{i}",
                "lat": base_lat + (i * 0.001),
                "lon": base_lon + (i * 0.001),
                "risk_score": risk_score,
                "risk_category": category,
                "risk_label": labels[category],
                "elevation": 1200 + i,
                "slope": 20 + (i % 20),
                "rainfall_24h": 50 + (i % 100),
                "rainfall_72h": 100 + (i % 200),
                "historical_landslide_density": risk_score * 0.8,
                "top_contributors": ["Rainfall (24h)", "Slope"],
                "model_version": self.metadata.get("model_version", "rf-v1"),
                "prediction_timestamp": self.metadata.get("prediction_timestamp", datetime.now(timezone.utc).isoformat()),
                "is_demo_data": True
            })

    def get_all_features(self, bbox: str = None, risk_category: int = None, limit: int = None) -> List[Dict[str, Any]]:
        results = self.features
        if risk_category:
            results = [f for f in results if f.get("risk_category") == risk_category]
        if bbox:
            try:
                minLon, minLat, maxLon, maxLat = map(float, bbox.split(","))
                results = [f for f in results if minLon <= f["lon"] <= maxLon and minLat <= f["lat"] <= maxLat]
            except Exception:
                pass
        if limit:
            results = results[:limit]
        return results

    def get_cell(self, cell_id: str) -> Optional[Dict[str, Any]]:
        for f in self.features:
            if f.get("cell_id") == cell_id:
                return f
        return None

    def _distance(self, lat1, lon1, lat2, lon2):
        return math.sqrt((lat1 - lat2)**2 + (lon1 - lon2)**2)

    def get_nearest_cell(self, lat: float, lon: float) -> Optional[Dict[str, Any]]:
        if not self.features:
            return None
        return min(self.features, key=lambda f: self._distance(lat, lon, f["lat"], f["lon"]))

    def get_hotspots(self, n: int = 10, min_risk_score: float = 0.5) -> List[Dict[str, Any]]:
        hotspots = [f for f in self.features if f.get("risk_score", 0) >= min_risk_score]
        hotspots.sort(key=lambda x: x.get("risk_score", 0), reverse=True)
        return hotspots[:n]

    def get_summary(self) -> Dict[str, Any]:
        if not self.features:
            return {}
        scores = [f.get("risk_score", 0) for f in self.features]
        rain24 = [f.get("rainfall_24h", 0) for f in self.features]
        rain72 = [f.get("rainfall_72h", 0) for f in self.features]
        
        return {
            "high_risk_cells": sum(1 for f in self.features if f.get("risk_category") == 3),
            "very_high_risk_cells": sum(1 for f in self.features if f.get("risk_category") == 4),
            "total_cells": len(self.features),
            "max_risk_score": max(scores) if scores else 0,
            "mean_risk_score": sum(scores)/len(scores) if scores else 0,
            "max_rainfall_24h": max(rain24) if rain24 else 0,
            "mean_rainfall_24h": sum(rain24)/len(rain24) if rain24 else 0,
            "max_rainfall_72h": max(rain72) if rain72 else 0,
            "active_alerts": len(self.get_alerts()),
            "model_version": self.metadata.get("model_version", "rf-v1"),
            "prediction_timestamp": self.metadata.get("prediction_timestamp", ""),
            "is_demo_data": self.is_demo_data or self.features[0].get("is_demo_data", False),
            "risk_distribution": self.get_risk_distribution()
        }

    def get_model_metadata(self) -> Dict[str, Any]:
        return self.metadata

    def get_alerts(self, watch_threshold=0.5, alert_threshold=0.7, high_alert_threshold=0.85) -> List[Dict[str, Any]]:
        alerts = []
        for i, f in enumerate(self.get_hotspots(n=20, min_risk_score=watch_threshold)):
            score = f.get("risk_score", 0)
            if score >= high_alert_threshold:
                severity = "HIGH_ALERT"
                label = "High Alert"
            elif score >= alert_threshold:
                severity = "ALERT"
                label = "Alert"
            else:
                severity = "WATCH"
                label = "Watch"
            
            alerts.append({
                "alert_id": f"ALT-{str(i+1).zfill(3)}",
                "severity": severity,
                "severity_label": label,
                "risk_score": score,
                "cell_id": f.get("cell_id", ""),
                "lat": f.get("lat", 0),
                "lon": f.get("lon", 0),
                "trigger_reason": f"Risk score {score:.2f} exceeds threshold. Rainfall 24h: {f.get('rainfall_24h', 0)}mm.",
                "created_at": datetime.now(timezone.utc).isoformat(),
                "expires_at": ""
            })
        return alerts

    def get_risk_distribution(self) -> Dict[str, int]:
        dist = {"Low": 0, "Moderate": 0, "High": 0, "Very High": 0}
        for f in self.features:
            label = f.get("risk_label")
            if label in dist:
                dist[label] += 1
        return dist

    def get_rainfall_stats(self) -> Dict[str, float]:
        rain24 = [f.get("rainfall_24h", 0) for f in self.features]
        rain72 = [f.get("rainfall_72h", 0) for f in self.features]
        return {
            "max_24h": max(rain24) if rain24 else 0,
            "mean_24h": sum(rain24)/len(rain24) if rain24 else 0,
            "max_72h": max(rain72) if rain72 else 0
        }

engine = None
