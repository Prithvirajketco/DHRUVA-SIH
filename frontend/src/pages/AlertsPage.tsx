import React from 'react';
import { AlertTriangle, MapPin, Calendar, ArrowRight } from 'lucide-react';

export default function AlertsPage() {
  const alerts = [
    { id: 1, location: 'Haflong', risk: 'HIGH', score: 84, reason: 'Heavy rainfall, High soil moisture, Steep slope', action: 'Prepare evacuation of vulnerable areas. Dispatch field team.', time: '10 mins ago', active: true },
    { id: 2, location: 'Mahur', risk: 'MODERATE', score: 58, reason: 'Historical landslide activity, Ground deformation', action: 'Monitor closely. Update IoT sensors.', time: '2 hrs ago', active: true },
    { id: 3, location: 'Umrangso', risk: 'VERY HIGH', score: 92, reason: 'Extreme rainfall, River overflow warning', action: 'Immediate evacuation of sector 4.', time: '1 day ago', active: false },
  ];

  return (
    <div className="p-8 h-full overflow-y-auto bg-slate-950 text-slate-200">
      <h1 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
        <AlertTriangle className="text-orange-500" size={32} />
        Alert History
      </h1>

      <div className="flex flex-col gap-4">
        {alerts.map((alert) => (
          <div key={alert.id} className={`p-6 rounded-xl border shadow-sm glass-card ${
            alert.active 
              ? alert.risk === 'VERY HIGH' ? 'bg-risk-very-high/10 border-risk-very-high/30' : 
                alert.risk === 'HIGH' ? 'bg-risk-high/10 border-risk-high/30' : 'bg-risk-moderate/10 border-risk-moderate/30'
              : 'border-white/5 opacity-70 bg-slate-900/50'
          }`}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded font-bold text-sm text-white ${
                  alert.risk === 'VERY HIGH' ? 'bg-risk-very-high shadow-[0_0_10px_var(--risk-very-high)]' : 
                  alert.risk === 'HIGH' ? 'bg-risk-high shadow-[0_0_10px_var(--risk-high)]' : 'bg-risk-moderate !text-slate-900 shadow-[0_0_10px_var(--risk-moderate)]'
                }`}>
                  {alert.risk} RISK
                </span>
                <span className="font-bold text-xl text-white flex items-center gap-2">
                  <MapPin size={18} className="text-slate-400" />
                  {alert.location}
                </span>
                <span className="text-sm font-semibold text-slate-300 bg-slate-900/50 px-2 py-1 rounded border border-slate-700">Score: {alert.score}/100</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
                <Calendar size={16} />
                {alert.time}
                {!alert.active && <span className="ml-2 bg-slate-800 border border-slate-700 text-slate-400 px-2 py-1 rounded text-xs font-bold">RESOLVED</span>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Main Contributing Factors</h4>
                <p className="text-slate-200 text-sm leading-relaxed">{alert.reason}</p>
              </div>
              <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Recommended Action</h4>
                <p className="text-slate-200 text-sm leading-relaxed flex items-start gap-2">
                  <ArrowRight size={16} className="text-blue-400 shrink-0 mt-0.5" />
                  {alert.action}
                </p>
              </div>
            </div>
            
            {alert.active && (
              <div className="mt-4 flex gap-3">
                <button className="px-4 py-2 bg-accent/20 hover:bg-accent/40 text-accent text-sm font-bold rounded-lg transition-colors border border-accent/50 shadow-[0_0_10px_rgba(249,115,22,0.1)]">
                  Acknowledge
                </button>
                <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-bold rounded-lg transition-colors border border-slate-700 shadow-sm">
                  Escalate
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
