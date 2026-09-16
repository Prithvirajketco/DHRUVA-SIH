import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Polyline, useMap } from 'react-leaflet';
import { AlertTriangle, CloudRain, Droplets, Mountain, History, Activity, Zap } from 'lucide-react';
import AIPredictionGraph from '../components/AIPredictionGraph';
import { DemoLocation } from '../data/demoLocations';
import { RiskResult } from '../utils/riskCalculator';

interface RiskCardProps {
  location: DemoLocation;
  risk: RiskResult;
  isSimulating: boolean;
  onClose: () => void;
  onRunSimulation: () => void;
  onShowRoute: () => void;
}

export default function RiskCard({ location, risk, isSimulating, onClose, onRunSimulation, onShowRoute }: RiskCardProps) {
  const getRiskColor = (level: string) => {
    if (level === 'HIGH') return 'text-risk-high';
    if (level === 'MEDIUM') return 'text-risk-moderate';
    return 'text-risk-low';
  };

  const getRiskBg = (level: string) => {
    if (level === 'HIGH') return 'bg-risk-high/10 border-risk-high/30';
    if (level === 'MEDIUM') return 'bg-risk-moderate/10 border-risk-moderate/30';
    return 'bg-risk-low/10 border-risk-low/30';
  };

  return (
    <div className="absolute right-4 top-4 bottom-4 w-[450px] glass-panel bg-slate-950/80 border border-white/10 rounded-xl z-[1000] p-5 flex flex-col overflow-y-auto text-slate-200 hide-scrollbar">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-2xl font-bold text-white">{location.name}</h2>
          <p className="text-sm text-slate-400">Lat: {location.lat} | Lon: {location.lon}</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-lg text-slate-500">
          ✕
        </button>
      </div>

      {/* Main Risk Score */}
      <div className={`p-4 rounded-xl border mb-4 flex items-center justify-between glass-card ${getRiskBg(risk.level)}`}>
        <div>
          <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest">Risk Score</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className={`text-4xl font-black ${getRiskColor(risk.level)}`}>{risk.score}</span>
            <span className="text-slate-400 font-medium">/ 100</span>
          </div>
        </div>
        <div className={`px-4 py-2 rounded-lg font-bold text-lg border shadow-lg ${
          risk.level === 'HIGH' ? 'bg-risk-high border-risk-high text-white shadow-[0_0_15px_var(--risk-high)]' : 
          risk.level === 'MEDIUM' ? 'bg-risk-moderate border-risk-moderate text-slate-900 shadow-[0_0_15px_var(--risk-moderate)]' : 
          'bg-risk-low border-risk-low text-white shadow-[0_0_15px_var(--risk-low)]'
        }`}>
          {risk.level}
        </div>
      </div>

      {/* Factors Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800">
          <div className="flex items-center gap-2 text-slate-400 mb-1"><CloudRain size={16}/> <span className="text-xs font-semibold">RAINFALL (24H)</span></div>
          <span className={`text-lg font-bold ${isSimulating ? 'text-blue-400' : 'text-slate-200'}`}>{location.rainfall} mm</span>
        </div>
        <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800">
          <div className="flex items-center gap-2 text-slate-400 mb-1"><Mountain size={16}/> <span className="text-xs font-semibold">SLOPE</span></div>
          <span className="text-lg font-bold text-slate-200">{location.slope}°</span>
        </div>
        <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800">
          <div className="flex items-center gap-2 text-slate-400 mb-1"><Droplets size={16}/> <span className="text-xs font-semibold">SOIL MOISTURE</span></div>
          <span className="text-lg font-bold text-slate-200">{location.soil_moisture}%</span>
        </div>
        <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800">
          <div className="flex items-center gap-2 text-slate-400 mb-1"><Activity size={16}/> <span className="text-xs font-semibold">DEFORMATION</span></div>
          <span className="text-lg font-bold text-slate-200">{location.ground_deformation} mm/yr</span>
        </div>
      </div>

      {/* Top Contributors */}
      <div className="mb-4">
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Main Contributing Factors</h4>
        <div className="flex flex-col gap-1.5">
          {risk.contributors.map((c, i) => (
            <div key={i} className="flex items-center gap-2 text-sm bg-slate-900/50 px-3 py-2 rounded border border-slate-800">
              <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400">{i+1}</span>
              <span className="text-slate-200 font-medium">{c}</span>
            </div>
          ))}
        </div>
      </div>

      {/* AI Prediction */}
      <AIPredictionGraph currentRisk={risk.score} isSimulating={isSimulating} />

      {/* Alerts & Actions (Only if HIGH) */}
      {risk.level === 'HIGH' && (
        <div className="mt-4 bg-risk-high/10 border border-risk-high/30 rounded-lg p-4 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center gap-2 text-risk-high mb-2">
            <AlertTriangle className="animate-pulse" />
            <h3 className="font-bold text-lg">HIGH LANDSLIDE RISK</h3>
          </div>
          <p className="text-sm text-slate-300 mb-4">
            Recommended Action: Prepare evacuation of vulnerable areas immediately. Dispatch field team to monitor ground cracks.
          </p>
          <div className="flex gap-2">
            <button onClick={onShowRoute} className="flex-1 bg-risk-high hover:bg-risk-high/80 text-white font-bold py-2 rounded-lg text-sm transition-colors shadow-lg shadow-risk-high/20 border border-risk-high/50">
              VIEW EVACUATION ROUTE
            </button>
          </div>
          <p className="text-[10px] text-risk-high/60 mt-3 text-center uppercase tracking-wider">
            Final decisions remain with authorized personnel.
          </p>
        </div>
      )}

      {/* Simulation Button */}
      <div className="mt-auto pt-4 border-t border-slate-800">
        <button 
          onClick={onRunSimulation}
          disabled={isSimulating}
          className={`w-full py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all
            ${isSimulating 
              ? 'bg-white/5 text-slate-500 border border-white/10 cursor-not-allowed' 
              : 'bg-accent/20 hover:bg-accent/40 text-accent shadow-[0_0_20px_rgba(249,115,22,0.3)] border border-accent/50'}`}
        >
          <Zap size={18} />
          {isSimulating ? 'SIMULATION ACTIVE' : 'RUN HEAVY RAINFALL SIMULATION'}
        </button>
      </div>
    </div>
  );
}
