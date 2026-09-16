export interface RiskFeature {
  cell_id: string;
  lat: number;
  lon: number;
  risk_score: number;
  risk_category: number;
  risk_label: string;
  elevation: number;
  slope: number;
  rainfall_24h: number;
  rainfall_72h: number;
  historical_landslide_density: number;
  top_contributors: string[];
  model_version: string;
  prediction_timestamp: string;
  is_demo_data: boolean;
  pore_water_pressure?: number;
  soil_saturation?: number;
  lstm_lead_time?: number;
}

export interface DashboardSummary {
  total_cells: number;
  very_high_risk: number;
  high_risk: number;
  moderate_risk: number;
  low_risk: number;
  active_alerts: number;
  max_rainfall_24h: number;
}

export interface Alert {
  id: number;
  alert_id: string;
  level: string;
  message: string;
  timestamp: string;
}

export interface Incident {
  id: number;
  incident_id: string;
  location: string;
  lat: number;
  lon: number;
  description: string;
  status: string;
  reported_at: string;
}

export interface HealthStatus {
  status: string;
  model_version: string;
  prediction_timestamp: string;
  total_cells: number;
  is_demo_data: boolean;
}
