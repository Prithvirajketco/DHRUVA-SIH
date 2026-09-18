import React from 'react';
import { AlertTriangle, MapPin, Calendar, ArrowRight } from 'lucide-react';

export default function AlertsPage() {
  const alerts = [
    { id: 1, location: 'Haflong', risk: 'HIGH', score: 84, reason: 'Heavy rainfall, High soil moisture, Steep slope', action: 'Prepare evacuation of vulnerable areas. Dispatch field team.', time: '10 mins ago', active: true },
    { id: 2, location: 'Mahur', risk: 'MODERATE', score: 58, reason: 'Historical landslide activity, Ground deformation', action: 'Monitor closely. Update IoT sensors.', time: '2 hrs ago', active: true },
    { id: 3, location: 'Umrangso', risk: 'VERY HIGH', score: 92, reason: 'Extreme rainfall, River overflow warning', action: 'Immediate evacuation of sector 4.', time: '1 day ago', active: false },
  ];

  return (
    <div className="p-8 h-full overflow-y-auto bg-[#F4F5F7] text-slate-700">
      <h1 className="text-3xl font-bold text-[#1E293B] mb-8 flex items-center gap-3">
        <AlertTriangle className="text-orange-500" size={32} />
        Alert History
      </h1>

      <div className="flex flex-col gap-4">
        {alerts.map((alert) => (
          <div key={alert.id} className={`p-6 rounded-xl border shadow-sm bg-white transition-all ${
            alert.active 
              ? alert.risk === 'VERY HIGH' ? 'border-risk-very-high/40 shadow-[0_4px_20px_rgba(225,29,72,0.1)]' : 
                alert.risk === 'HIGH' ? 'border-risk-high/40 shadow-[0_4px_20px_rgba(249,115,22,0.1)]' : 'border-risk-moderate/40 shadow-[0_4px_20px_rgba(245,158,11,0.1)]'
              : 'border-slate-200 opacity-80'
          }`}>
            <div className="flex flex-col md:flex-row justify-between items-start mb-4 gap-4 md:gap-0">
              <div className="flex flex-wrap items-center gap-3">
                <span className={`px-3 py-1 rounded font-bold text-sm text-white ${
                  alert.risk === 'VERY HIGH' ? 'bg-risk-very-high shadow-sm' : 
                  alert.risk === 'HIGH' ? 'bg-risk-high shadow-sm' : 'bg-risk-moderate !text-slate-900 shadow-sm'
                }`}>
                  {alert.risk} RISK
                </span>
                <span className="font-bold text-xl text-[#1E293B] flex items-center gap-2">
                  <MapPin size={18} className="text-slate-400" />
                  {alert.location}
                </span>
                <span className="text-sm font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded border border-slate-200">Score: {alert.score}/100</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-slate-500 text-sm font-medium">
                <Calendar size={16} />
                {alert.time}
                {!alert.active && <span className="ml-2 bg-slate-100 border border-slate-200 text-slate-500 px-2 py-1 rounded text-xs font-bold">RESOLVED</span>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Main Contributing Factors</h4>
                <p className="text-[#1E293B] font-medium text-sm leading-relaxed">{alert.reason}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Recommended Action</h4>
                <p className="text-[#1E293B] font-medium text-sm leading-relaxed flex items-start gap-2">
                  <ArrowRight size={16} className="text-blue-500 shrink-0 mt-0.5" />
                  {alert.action}
                </p>
              </div>
            </div>
            
            {alert.active && (
              <div className="mt-4 flex gap-3">
                <button className="px-4 py-2 bg-[#E11D48] hover:bg-rose-700 text-white text-sm font-bold rounded-lg transition-colors shadow-sm">
                  Acknowledge
                </button>
                <button className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-sm font-bold rounded-lg transition-colors border border-slate-300 shadow-sm">
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
