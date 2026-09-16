import { RiskFeature, DashboardSummary, Alert, Incident, HealthStatus } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// Generate fallback data
const generateMockFeatures = (): RiskFeature[] => {
  const features: RiskFeature[] = [];
  for (let i = 0; i < 50; i++) {
    const lat = 25.0 + Math.random() * 1.2;
    const lon = 92.2 + Math.random() * 1.6;
    const risk_score = Math.random();
    let risk_category = 1;
    let risk_label = 'Low';
    if (risk_score > 0.8) { risk_category = 4; risk_label = 'Very High'; }
    else if (risk_score > 0.6) { risk_category = 3; risk_label = 'High'; }
    else if (risk_score > 0.3) { risk_category = 2; risk_label = 'Moderate'; }

    features.push({
      cell_id: `cell_${i}`,
      lat,
      lon,
      risk_score,
      risk_category,
      risk_label,
      elevation: 500 + Math.random() * 1000,
      slope: Math.random() * 45,
      rainfall_24h: Math.random() * 150,
      rainfall_72h: Math.random() * 300,
      historical_landslide_density: Math.random(),
      top_contributors: ['Rainfall (24h)', 'Pore Pressure', 'Slope'].slice(0, Math.floor(Math.random() * 2) + 1),
      model_version: '1.0.0-mock',
      prediction_timestamp: new Date().toISOString(),
      is_demo_data: true,
      pore_water_pressure: 30 + Math.random() * 30,
      soil_saturation: 50 + Math.random() * 45,
      lstm_lead_time: Math.floor(6 + Math.random() * 66),
    });
  }
  return features.sort((a, b) => b.risk_score - a.risk_score);
};

const mockFeatures = generateMockFeatures();

export const fetchHealth = async (): Promise<HealthStatus> => {
  try {
    const res = await fetch(`${API_URL}/health`);
    if (!res.ok) throw new Error('API down');
    return res.json();
  } catch (e) {
    return { status: 'mock', model_version: '1.0.0', prediction_timestamp: new Date().toISOString(), total_cells: 50, is_demo_data: true };
  }
};

export const fetchRiskMap = async (): Promise<any> => {
  try {
    const res = await fetch(`${API_URL}/map/risk`);
    if (!res.ok) throw new Error('API down');
    return res.json();
  } catch (e) {
    return {
      type: 'FeatureCollection',
      features: mockFeatures.map(f => ({ type: 'Feature', properties: f, geometry: { type: 'Point', coordinates: [f.lon, f.lat] } }))
    };
  }
};

export const fetchDashboardSummary = async (): Promise<DashboardSummary> => {
  try {
    const res = await fetch(`${API_URL}/dashboard/summary`);
    if (!res.ok) throw new Error('API down');
    return res.json();
  } catch (e) {
    return {
      total_cells: 50,
      very_high_risk: mockFeatures.filter(f => f.risk_category === 4).length,
      high_risk: mockFeatures.filter(f => f.risk_category === 3).length,
      moderate_risk: mockFeatures.filter(f => f.risk_category === 2).length,
      low_risk: mockFeatures.filter(f => f.risk_category === 1).length,
      active_alerts: 2,
      max_rainfall_24h: 145.2,
    };
  }
};

export const fetchHotspots = async (): Promise<RiskFeature[]> => {
  try {
    const res = await fetch(`${API_URL}/dashboard/hotspots`);
    if (!res.ok) throw new Error('API down');
    return res.json();
  } catch (e) {
    return mockFeatures.slice(0, 10);
  }
};

export const fetchAlerts = async (): Promise<Alert[]> => {
  try {
    const res = await fetch(`${API_URL}/alerts`);
    if (!res.ok) throw new Error('API down');
    return res.json();
  } catch (e) {
    return [];
  }
};

export const fetchIncidents = async (): Promise<Incident[]> => {
  try {
    const res = await fetch(`${API_URL}/incidents`);
    if (!res.ok) throw new Error('API down');
    return res.json();
  } catch (e) {
    return [];
  }
};
