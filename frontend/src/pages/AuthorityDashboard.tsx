import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import HotspotTable from '../components/HotspotTable';
import RiskDistributionChart from '../components/RiskDistributionChart';
import { fetchDashboardSummary, fetchHotspots, fetchAlerts, fetchHealth } from '../services/api';
import { DashboardSummary, RiskFeature, Alert, HealthStatus } from '../types';
import { AlertTriangle, Info, Bell } from 'lucide-react';

export default function AuthorityDashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [hotspots, setHotspots] = useState<RiskFeature[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [health, setHealth] = useState<HealthStatus | null>(null);

  useEffect(() => {
    Promise.all([fetchDashboardSummary(), fetchHotspots(), fetchAlerts(), fetchHealth()]).then(
      ([s, h, a, hl]) => {
        setSummary(s);
        setHotspots(h);
        setAlerts(a);
        setHealth(hl);
      }
    );
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col w-full">
      <Navbar modelVersion={health?.model_version} timestamp={health?.prediction_timestamp} />
      
      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">Authority Dashboard — Dima Hasao</h1>

        {/* KPI Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <KpiCard title="Very High Risk Cells" value={summary.very_high_risk} color="text-red-600" bg="bg-red-50" />
            <KpiCard title="High Risk Cells" value={summary.high_risk} color="text-orange-600" bg="bg-orange-50" />
            <KpiCard title="Active Alerts" value={summary.active_alerts} color="text-slate-800" bg="bg-white" />
            <KpiCard title="Max 24h Rainfall" value={`${summary.max_rainfall_24h.toFixed(1)} mm`} color="text-blue-600" bg="bg-blue-50" />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2 flex flex-col gap-4">
            <h2 className="text-lg font-bold text-slate-800">Top Risk Hotspots</h2>
            <HotspotTable hotspots={hotspots} />
          </div>
          
          <div className="flex flex-col gap-8">
            {summary && <RiskDistributionChart summary={summary} />}

            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Info size={20} className="text-blue-500" />
                Model Info
              </h2>
              {health && (
                <div className="space-y-3 text-sm text-slate-600">
                  <div className="flex justify-between border-b pb-2"><span>Version:</span><span className="font-semibold">{health.model_version}</span></div>
                  <div className="flex justify-between border-b pb-2"><span>Total Analyzed Cells:</span><span className="font-semibold">{health.total_cells}</span></div>
                  <div className="flex justify-between border-b pb-2"><span>Status:</span><span className="font-semibold text-green-600 uppercase">{health.status}</span></div>
                  <div className="flex justify-between"><span>Last Run:</span><span className="font-semibold">{new Date(health.prediction_timestamp).toLocaleString()}</span></div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Bell size={20} className="text-slate-600" />
            Active Alerts
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {alerts.map((alert) => (
              <div key={alert.alert_id} className={`p-4 rounded-xl border flex gap-4 items-start ${alert.level === 'HIGH_ALERT' ? 'bg-red-50 border-red-200' : 'bg-orange-50 border-orange-200'}`}>
                <AlertTriangle className={alert.level === 'HIGH_ALERT' ? 'text-red-500' : 'text-orange-500'} />
                <div>
                  <div className={`font-bold ${alert.level === 'HIGH_ALERT' ? 'text-red-800' : 'text-orange-800'}`}>{alert.level.replace('_', ' ')}</div>
                  <div className="text-slate-700 text-sm mt-1">{alert.message}</div>
                  <div className="text-slate-400 text-xs mt-2">{new Date(alert.timestamp).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}

function KpiCard({ title, value, color, bg }: { title: string; value: string | number; color: string; bg: string }) {
  return (
    <div className={`p-6 rounded-xl border border-slate-200 shadow-sm ${bg}`}>
      <div className="text-slate-500 text-sm font-semibold mb-2 uppercase tracking-wide">{title}</div>
      <div className={`text-4xl font-black ${color}`}>{value}</div>
    </div>
  );
}
