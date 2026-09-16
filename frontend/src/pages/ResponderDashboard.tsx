import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { MapContainer, TileLayer, CircleMarker } from 'react-leaflet';
import { fetchHotspots, fetchIncidents, fetchHealth } from '../services/api';
import { RiskFeature, Incident, HealthStatus } from '../types';
import { getRiskColor, getRiskBgColor, getRiskTextColor } from '../utils/riskColors';

const DIMA_HASAO_CENTER: [number, number] = [25.51, 93.01];

export default function ResponderDashboard() {
  const [hotspots, setHotspots] = useState<RiskFeature[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [health, setHealth] = useState<HealthStatus | null>(null);

  useEffect(() => {
    Promise.all([fetchHotspots(), fetchIncidents(), fetchHealth()]).then(([h, i, hl]) => {
      setHotspots(h.filter(x => x.risk_category >= 3)); // Only high/very high
      setIncidents(i);
      setHealth(hl);
    });
  }, []);

  return (
    <div className="flex flex-col h-screen w-full bg-slate-50">
      <Navbar modelVersion={health?.model_version} timestamp={health?.prediction_timestamp} />
      
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <h1 className="text-2xl font-bold text-slate-800">Responder Dashboard</h1>
        <p className="text-slate-500 text-sm">Actionable view of high-priority zones and active incidents.</p>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden w-full">
        {/* MAP */}
        <div className="w-full lg:w-1/2 h-96 lg:h-full z-0 relative">
          <MapContainer center={DIMA_HASAO_CENTER} zoom={9} className="w-full h-full">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {hotspots.map((f) => (
              <CircleMarker
                key={f.cell_id}
                center={[f.lat, f.lon]}
                radius={12}
                pathOptions={{
                  color: getRiskColor(f.risk_category),
                  fillColor: getRiskColor(f.risk_category),
                  fillOpacity: 0.8,
                  weight: 3,
                  className: 'animate-pulse' // Pulsing effect for responders
                }}
              />
            ))}
          </MapContainer>
        </div>

        {/* LISTS */}
        <div className="w-full lg:w-1/2 h-full overflow-y-auto p-6 flex flex-col gap-8 bg-slate-50">
          
          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Prioritized Locations</h2>
            <div className="flex flex-col gap-3">
              {hotspots.slice(0, 5).map((h, i) => (
                <div key={h.cell_id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl font-black text-slate-300">#{i+1}</div>
                    <div>
                      <div className="font-semibold text-slate-800">{h.lat.toFixed(4)}, {h.lon.toFixed(4)}</div>
                      <div className="text-sm text-slate-500">Score: {(h.risk_score * 100).toFixed(1)}%</div>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-bold ${getRiskBgColor(h.risk_category)} ${getRiskTextColor(h.risk_category)}`}>
                    {h.risk_label}
                  </div>
                </div>
              ))}
              {hotspots.length === 0 && <div className="text-slate-500">No high risk areas currently.</div>}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Recent Incidents</h2>
            <div className="flex flex-col gap-3">
              {incidents.map((inc) => (
                <div key={inc.incident_id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-semibold text-slate-800">{inc.location}</div>
                    <div className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md">{inc.status}</div>
                  </div>
                  <div className="text-slate-600 text-sm mb-2">{inc.description}</div>
                  <div className="text-xs text-slate-400">{new Date(inc.reported_at).toLocaleString()}</div>
                </div>
              ))}
              {incidents.length === 0 && <div className="text-slate-500">No active incidents.</div>}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
