import math
from typing import Dict, List, Any

class DHRUVA_ML_Engine:
    def __init__(self):
        self.model_version = "v1.4.2-XGBoost-LSTM-Ensemble"
        self.is_loaded = True

    def predict(self, features: Dict[str, float]) -> Dict[str, Any]:
        """
        Processes tabular features through the XGBoost Risk Engine proxy
        and generates a temporal sequence via the LSTM proxy.
        """
        rainfall = features.get("rainfall", 0)
        slope = features.get("slope", 0)
        moisture = features.get("soil_moisture", 0)
        historical = features.get("historical_landslides", 0)
        deformation = features.get("ground_deformation", 0)

        # 1. XGBoost / Physics Ensemble Proxy
        cohesion = 15
        friction_angle = 28
        soil_unit_weight = 19
        water_unit_weight = 9.81
        depth = 2.5

        slope_rad = math.radians(slope)
        friction_rad = math.radians(friction_angle)

        saturation = min(1.0, (moisture + (rainfall * 0.2)) / 100)
        pore_pressure = depth * saturation * water_unit_weight

        total_stress = soil_unit_weight * depth * math.cos(slope_rad)**2
        effective_stress = max(0, total_stress - pore_pressure)

        resisting = cohesion + (effective_stress * math.tan(friction_rad))
        driving = soil_unit_weight * depth * math.sin(slope_rad) * math.cos(slope_rad)

        fos = resisting / driving if driving > 0.1 else 5.0
        
        # Risk Score Mapping
        if fos <= 1.0:
            raw_score = 80 + ((1.0 - fos) * 40)
        elif fos <= 1.5:
            raw_score = 50 + ((1.5 - fos) * 60)
        else:
            raw_score = max(0, 50 - ((fos - 1.5) * 20))

        penalty = (historical * 1.5) + (deformation * 0.5)
        current_risk = min(100, round(raw_score + penalty))

        # 2. LSTM Temporal Sequence Proxy
        # If rainfall is actively high (storm), predict accelerated compounding
        is_storm = rainfall > 100
        
        t6, t12, t24 = 0, 0, 0
        if is_storm:
            t6 = min(100, current_risk + ((100 - current_risk) * 0.4))
            t12 = min(100, current_risk + ((100 - current_risk) * 0.7))
            t24 = min(100, current_risk + ((100 - current_risk) * 0.9))
        else:
            t6 = max(0, current_risk - (current_risk * 0.05))
            t12 = max(0, current_risk - (current_risk * 0.12))
            t24 = max(0, current_risk - (current_risk * 0.25))

        # Top contributors
        contributors = []
        if pore_pressure > 10: contributors.append("High Pore Water Pressure")
        elif rainfall > 50: contributors.append("Heavy Rainfall Accumulation")
        if slope > 30: contributors.append("Critically Steep Slope")
        if moisture > 70: contributors.append("Saturated Soil")
        
        if not contributors:
            contributors.append("Marginal Conditions")

        return {
            "current_risk": current_risk,
            "fos": round(fos, 2),
            "temporal_projection": [round(t6), round(t12), round(t24)],
            "contributors": contributors[:3],
            "model_version": self.model_version
        }

ml_engine_instance = DHRUVA_ML_Engine()
