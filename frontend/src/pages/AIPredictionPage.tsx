import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Activity, Brain, Database, Cpu, TrendingUp,
  ChevronRight, Zap, MapPin, Wind, Droplets,
  Mountain, Clock, X, FlaskConical
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  ReferenceLine, CartesianGrid, BarChart, Bar, Cell
} from 'recharts';
import { DIMA_HASAO_LOCATIONS, DemoLocation } from '../data/demoLocations';

interface MLResponse {
  current_risk: number;
  fos: number;
  temporal_projection: number[];
  contributors: string[];
  model_version: string;
}

interface LocationPrediction {
  loc: DemoLocation;
  result: MLResponse | null;
  loading: boolean;
  error: boolean;
}

// ── helpers ──────────────────────────────────────────────────────────────────
function getRiskColor(risk: number) {
  if (risk >= 85) return '#ef4444';
  if (risk >= 70) return '#f97316';
  if (risk >= 40) return '#eab308';
  return '#22c55e';
}
function getRiskBg(risk: number) {
  if (risk >= 85) return 'border-risk-very-high/30 bg-risk-very-high/10';
  if (risk >= 70) return 'border-risk-high/30 bg-risk-high/10';
  if (risk >= 40) return 'border-risk-moderate/30 bg-risk-moderate/10';
  return 'border-risk-low/30 bg-risk-low/10';
}
function getRiskLabel(risk: number) {
  if (risk >= 85) return { text: 'VERY HIGH', color: 'text-risk-very-high', dot: 'bg-risk-very-high' };
  if (risk >= 70) return { text: 'HIGH', color: 'text-risk-high', dot: 'bg-risk-high' };
  if (risk >= 40) return { text: 'MODERATE', color: 'text-risk-moderate', dot: 'bg-risk-moderate' };
  return { text: 'LOW', color: 'text-risk-low', dot: 'bg-risk-low' };
}
function getFosColor(fos: number) {
  if (fos <= 1.0) return '#ef4444';
  if (fos <= 1.5) return '#f59e0b';
  return '#22c55e';
}

const SLIDER_CONFIG = [
  { key: 'rainfall',              label: 'Rainfall',           unit: 'mm',  min: 0,  max: 350, step: 1,   color: '#3b82f6' },
  { key: 'slope',                 label: 'Slope',              unit: '°',   min: 0,  max: 70,  step: 0.5, color: '#f59e0b' },
  { key: 'soil_moisture',         label: 'Moisture',           unit: '%',   min: 0,  max: 100, step: 1,   color: '#10b981' },
  { key: 'historical_landslides', label: 'Hist. Events',       unit: '',    min: 0,  max: 10,  step: 1,   color: '#ef4444' },
  { key: 'ground_deformation',    label: 'Deformation',        unit: 'mm',  min: 0,  max: 100, step: 1,   color: '#a855f7' },
];

async function fetchPrediction(loc: DemoLocation, rainfallBoost: number): Promise<MLResponse> {
  const body = {
    rainfall:              Math.min(350, loc.rainfall + rainfallBoost),
    slope:                 loc.slope,
    soil_moisture:         Math.min(100, loc.soil_moisture + rainfallBoost * 0.15),
    historical_landslides: loc.historical_landslides,
    ground_deformation:    loc.ground_deformation,
  };
  const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1';
  const res = await fetch(`${API_URL}/ml/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('backend error');
  return res.json();
}

// ── Detail Panel ──────────────────────────────────────────────────────────────
function LocationDetailPanel({
  pred,
  rainfallBoost,
  onClose,
}: {
  pred: LocationPrediction;
  rainfallBoost: number;
  onClose: () => void;
}) {
  const { loc, result } = pred;
  const [activeStage, setActiveStage] = useState(-1);

  // Animate pipeline on open
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const run = async () => {
      setActiveStage(0); await new Promise(r => { t = setTimeout(r, 500); });
      setActiveStage(1); await new Promise(r => { t = setTimeout(r, 500); });
      setActiveStage(2); await new Promise(r => { t = setTimeout(r, 500); });
      setActiveStage(-1);
    };
    run();
    return () => clearTimeout(t);
  }, []);

  // Physics for this location
  const rf = Math.min(350, loc.rainfall + rainfallBoost);
  const sm = Math.min(100, loc.soil_moisture + rainfallBoost * 0.15);
  const depth = 2.5, cohesion = 15, frictionAngle = 28, soilUW = 19, waterUW = 9.81;
  const slopeRad = (loc.slope * Math.PI) / 180;
  const frictionRad = (frictionAngle * Math.PI) / 180;
  const sat = Math.min(1.0, (sm + rf * 0.2) / 100);
  const poreP = depth * sat * waterUW;
  const totalS = soilUW * depth * Math.cos(slopeRad) ** 2;
  const effS = Math.max(0, totalS - poreP);
  const resisting = cohesion + effS * Math.tan(frictionRad);
  const driving = soilUW * depth * Math.sin(slopeRad) * Math.cos(slopeRad);
  const fos = driving > 0.1 ? resisting / driving : 5.0;

  const chartData = result ? [
    { time: 'Today', risk: result.temporal_projection[0] },
    { time: '+6H', risk: result.temporal_projection[1] },
    { time: '+72H', risk: result.temporal_projection[2] },
  ] : [];

  const contribData = SLIDER_CONFIG.map(cfg => ({
    name: cfg.label,
    value: Math.round(((cfg.key === 'rainfall' ? rf : cfg.key === 'soil_moisture' ? sm : loc[cfg.key as keyof DemoLocation] as number) / cfg.max) * 100),
    color: cfg.color,
  }));

  const riskLabel = getRiskLabel(result?.current_risk ?? 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="glass-panel rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <MapPin size={20} className="text-blue-500" />
            <div>
              <h2 className="text-xl font-black text-white">{loc.name}</h2>
              <p className="text-xs text-slate-500 font-mono">{loc.lat.toFixed(3)}°N, {loc.lon.toFixed(3)}°E · {loc.elevation}m elev.</p>
            </div>
            <div className={`ml-3 flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold ${getRiskBg(result?.current_risk ?? 0)}`}>
              <div className={`w-2 h-2 rounded-full ${riskLabel.dot} ${result && result.current_risk >= 70 ? 'animate-pulse' : ''}`} />
              <span className={riskLabel.color}>{riskLabel.text}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors">
            <X size={18} className="text-slate-400" />
          </button>
        </div>

        <div className="p-5 grid grid-cols-1 lg:grid-cols-3 gap-5">

          <div className="lg:col-span-2 glass-card rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <TrendingUp size={14} className="text-blue-400" /> 24-Hour Forecast
              </h3>
              <span className="text-xs font-mono bg-slate-900 text-slate-400 px-2 py-1 rounded border border-slate-800">
                FoS: <span style={{ color: getFosColor(result?.fos ?? fos) }}>{(result?.fos ?? fos).toFixed(2)}</span>
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                { label: 'TODAY', val: result?.temporal_projection[0] },
                { label: '+6H',val: result?.temporal_projection[1] },
                { label: '+72H',val: result?.temporal_projection[2] },
              ].map((item, i) => (
                <div key={i} className="bg-slate-900/50 rounded-lg p-2 text-center border border-slate-800">
                  <p className="text-xs text-slate-500 font-semibold">{item.label}</p>
                  <p className="text-xl font-black" style={{ color: item.val !== undefined ? getRiskColor(item.val) : '#64748b' }}>
                    {item.val !== undefined ? `${item.val}%` : '—'}
                  </p>
                </div>
              ))}
            </div>
            <div className="h-44">
              {result ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} />
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                      formatter={(v: number) => [`${v}%`, 'Risk']} />
                    <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="4 4"
                      label={{ value: 'Critical', fill: '#ef444480', fontSize: 10, position: 'insideTopLeft' }} />
                    <Line type="monotone" dataKey="risk" stroke={getRiskColor(result.current_risk)}
                      strokeWidth={3} dot={{ r: 5, fill: '#ffffff', strokeWidth: 2, stroke: getRiskColor(result.current_risk) }}
                      animationDuration={400} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-600 font-mono text-sm animate-pulse">INFERENCING...</div>
              )}
            </div>
          </div>

          {/* Physics */}
          <div className="glass-card rounded-xl p-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Database size={12} className="text-yellow-500" /> Physics — FoS
            </h3>
            <div className="space-y-2 font-mono text-xs">
              {[
                { label: 'Pore Pressure', val: `${poreP.toFixed(1)} kPa`, color: 'text-blue-400' },
                { label: 'Effective Stress', val: `${effS.toFixed(1)} kPa`, color: 'text-yellow-400' },
                { label: 'Resisting', val: resisting.toFixed(1), color: 'text-green-600' },
                { label: 'Driving', val: driving.toFixed(1), color: 'text-red-400' },
              ].map(row => (
                <div key={row.label} className="bg-slate-900/50 rounded-lg px-3 py-2 flex justify-between">
                  <span className="text-slate-400">{row.label}</span>
                  <span className={`font-bold ${row.color}`}>{row.val}</span>
                </div>
              ))}
              <div className={`rounded-lg px-3 py-2 border ${fos <= 1 ? 'border-red-700 bg-red-900/20' : fos <= 1.5 ? 'border-yellow-700 bg-yellow-900/20' : 'border-green-700 bg-green-900/10'}`}>
                <p className="text-slate-500 mb-0.5">Factor of Safety</p>
                <p className="text-lg font-black" style={{ color: getFosColor(fos) }}>
                  {fos.toFixed(3)} <span className="text-xs font-normal">{fos <= 1 ? '⚠ FAILING' : fos <= 1.5 ? '⚡ MARGINAL' : '✓ STABLE'}</span>
                </p>
              </div>
            </div>

            {/* Contributors */}
            {result && (
              <div className="mt-3">
                <p className="text-xs font-bold text-slate-500 uppercase mb-2">Top Drivers</p>
                {result.contributors.map((c, i) => (
                  <div key={i} className="flex items-center gap-2 mb-1">
                    <span className="w-4 h-4 bg-blue-100 text-blue-600 flex items-center justify-center rounded text-xs font-bold shrink-0">{i + 1}</span>
                    <span className="text-xs text-slate-700">{c}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Feature bars */}
          <div className="glass-card rounded-xl p-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Brain size={12} className="text-blue-400" /> Feature Intensity
            </h3>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={contribData} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
                  <XAxis type="number" domain={[0, 100]} stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="name" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} width={72} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                    formatter={(v: number) => [`${v}%`, 'Relative']} />
                  <Bar dataKey="value" radius={[0, 3, 3, 0]} animationDuration={400}>
                    {contribData.map((entry, i) => <Cell key={i} fill={entry.color} fillOpacity={0.8} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Raw inputs */}
          <div className="glass-card rounded-xl p-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
              <FlaskConical size={12} className="text-green-500" /> Input Parameters
            </h3>
            <div className="space-y-2">
              {[
                { icon: <Droplets size={13} className="text-blue-500" />, label: 'Rainfall', val: `${rf.toFixed(0)} mm`, sub: rainfallBoost > 0 ? `(+${rainfallBoost}mm storm)` : '' },
                { icon: <Mountain size={13} className="text-yellow-500" />, label: 'Slope', val: `${loc.slope}°` },
                { icon: <Wind size={13} className="text-green-500" />, label: 'Soil Moisture', val: `${sm.toFixed(0)}%` },
                { icon: <Clock size={13} className="text-red-500" />, label: 'Historical Events', val: `${loc.historical_landslides}` },
                { icon: <Activity size={13} className="text-purple-500" />, label: 'Deformation', val: `${loc.ground_deformation} mm` },
              ].map(row => (
                <div key={row.label} className="flex items-center justify-between bg-slate-900/50 rounded-lg px-3 py-2 border border-slate-800">
                  <span className="flex items-center gap-2 text-xs text-slate-400">{row.icon}{row.label}</span>
                  <span className="text-xs font-bold text-slate-200">{row.val} <span className="text-slate-500">{row.sub}</span></span>
                </div>
              ))}
            </div>
          </div>

          {/* Pipeline */}
          <div className="lg:col-span-3 glass-card rounded-xl p-4 relative">
            <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-3">Active ML Pipeline — {loc.name}</p>
            <div className="flex flex-col sm:flex-row items-stretch gap-1">
              {[
                { stage: 0, icon: <Database size={14} />, title: 'Physics Engine', color: 'yellow', output: `FoS = ${fos.toFixed(3)}` },
                { stage: 1, icon: <Brain size={14} />, title: 'XGBoost Scorer', color: 'blue', output: `risk = ${result?.current_risk ?? '…'}%` },
                { stage: 2, icon: <Cpu size={14} />, title: 'LSTM Projection', color: 'purple', output: `+72h = ${result?.temporal_projection[2] ?? '…'}%` },
              ].map((s, i) => {
                const colors: Record<string, string> = {
                  yellow: activeStage === s.stage ? 'border-yellow-500 bg-yellow-900/20 shadow-[0_0_10px_rgba(234,179,8,0.2)]' : 'border-slate-800 bg-slate-900/50',
                  blue:   activeStage === s.stage ? 'border-blue-500 bg-blue-900/20 shadow-[0_0_10px_rgba(59,130,246,0.2)]' : 'border-slate-800 bg-slate-900/50',
                  purple: activeStage === s.stage ? 'border-purple-500 bg-purple-900/20 shadow-[0_0_10px_rgba(168,85,247,0.2)]' : 'border-slate-800 bg-slate-900/50',
                };
                const iconColors: Record<string, string> = { yellow: 'text-yellow-500', blue: 'text-blue-500', purple: 'text-purple-500' };
                return (
                  <React.Fragment key={s.stage}>
                    <div className={`flex-1 rounded-lg px-3 py-2.5 border transition-all duration-300 ${colors[s.color]}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={iconColors[s.color]}>{s.icon}</span>
                        <span className="text-xs font-bold text-slate-300">{s.title}</span>
                        {activeStage === s.stage && <span className="ml-auto text-xs animate-pulse font-mono" style={{ color: ['#f59e0b','#3b82f6','#a855f7'][s.stage] }}>RUNNING</span>}
                      </div>
                      <p className="font-mono text-xs font-bold" style={{ color: ['#fbbf24','#60a5fa','#c084fc'][s.stage] }}>→ {s.output}</p>
                    </div>
                    {i < 2 && <div className="flex items-center px-1"><ChevronRight size={14} className="text-slate-500" /></div>}
                  </React.Fragment>
                );
              })}
              <div className="flex items-center px-1"><ChevronRight size={14} className={result ? 'text-green-500' : 'text-slate-600'} /></div>
              <div className={`flex-1 rounded-lg px-3 py-2.5 border transition-all duration-300 ${result ? 'border-green-500/50 bg-green-900/20' : 'border-slate-800 bg-slate-900/50'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <Zap size={14} className={result ? 'text-green-500' : 'text-slate-500'} />
                  <span className="text-xs font-bold text-slate-300">API Output</span>
                </div>
                <p className="font-mono text-xs text-green-400">
                  {result ? `{ risk:${result.current_risk}%, fos:${result.fos} }` : 'awaiting...'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Location Card ─────────────────────────────────────────────────────────────
function LocationCard({
  pred,
  onClick,
  rainfallBoost,
}: {
  pred: LocationPrediction;
  onClick: () => void;
  rainfallBoost: number;
}) {
  const { loc, result, loading } = pred;
  const risk = result?.current_risk ?? null;
  const riskLabel = risk !== null ? getRiskLabel(risk) : null;
  const effectiveRainfall = Math.min(350, loc.rainfall + rainfallBoost);

  return (
    <button
      onClick={onClick}
      className={`w-full text-left glass-card rounded-xl p-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg group ${
        risk !== null ? getRiskBg(risk) : 'border-white/5 opacity-80'
      }`}
    >
      {/* Location name + badge */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-black text-white text-base group-hover:text-blue-400 transition-colors">{loc.name}</p>
          <p className="text-xs text-slate-500 font-mono">{loc.lat.toFixed(2)}°N · {loc.elevation}m</p>
        </div>
        {riskLabel && (
          <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-xs font-bold ${getRiskBg(risk!)}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${riskLabel.dot} ${risk! >= 70 ? 'animate-pulse' : ''}`} />
            <span className={riskLabel.color}>{riskLabel.text}</span>
          </div>
        )}
      </div>

      {/* Risk score gauge */}
      <div className="flex items-center gap-3 mb-3">
        {loading ? (
          <div className="flex-1 h-2 bg-slate-800 rounded-full animate-pulse" />
        ) : risk !== null ? (
          <>
            <div className="relative flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="absolute h-full rounded-full transition-all duration-500"
                style={{ width: `${risk}%`, backgroundColor: getRiskColor(risk) }}
              />
            </div>
            <span className="text-base font-black w-10 text-right" style={{ color: getRiskColor(risk) }}>
              {risk}%
            </span>
          </>
        ) : (
          <div className="flex-1 h-2 bg-slate-800 rounded-full" />
        )}
      </div>

      {/* Key stats row */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="flex items-center gap-1.5 bg-slate-900/50 rounded-lg px-2 py-1.5 border border-slate-800">
          <Droplets size={11} className="text-blue-400 shrink-0" />
          <span className="text-slate-300 truncate">{effectiveRainfall.toFixed(0)}mm</span>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-900/50 rounded-lg px-2 py-1.5 border border-slate-800">
          <Mountain size={11} className="text-yellow-400 shrink-0" />
          <span className="text-slate-300">{loc.slope}°</span>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-900/50 rounded-lg px-2 py-1.5 border border-slate-800">
          <Activity size={11} className="text-purple-400 shrink-0" />
          <span className="text-slate-300 truncate">FoS {result?.fos ?? '—'}</span>
        </div>
      </div>

      {/* Temporal mini-preview */}
      {result && (
        <div className="mt-2.5 flex items-center gap-1 text-xs text-slate-600">
          <Clock size={10} />
          <span>Today <span style={{ color: getRiskColor(result.temporal_projection[0]) }}>{result.temporal_projection[0]}%</span></span>
          <span className="mx-0.5">·</span>
          <span>+6h <span style={{ color: getRiskColor(result.temporal_projection[1]) }}>{result.temporal_projection[1]}%</span></span>
          <span className="mx-0.5">·</span>
          <span>+72h <span style={{ color: getRiskColor(result.temporal_projection[2]) }}>{result.temporal_projection[2]}%</span></span>
        </div>
      )}

      <p className="text-xs text-slate-600 mt-2 group-hover:text-slate-500 transition-colors">Click to expand full analysis →</p>
    </button>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AIPredictionPage() {
  const [predictions, setPredictions] = useState<LocationPrediction[]>(
    DIMA_HASAO_LOCATIONS.map(loc => ({ loc, result: null, loading: true, error: false }))
  );
  const [rainfallBoost, setRainfallBoost] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filterLevel, setFilterLevel] = useState<'ALL' | 'VERY_HIGH' | 'HIGH' | 'MODERATE' | 'LOW'>('ALL');
  const [modelVersion, setModelVersion] = useState('—');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runAll = useCallback(async (boost: number) => {
    setPredictions(prev => prev.map(p => ({ ...p, loading: true, error: false })));
    const results = await Promise.allSettled(
      DIMA_HASAO_LOCATIONS.map(loc => fetchPrediction(loc, boost))
    );
    setPredictions(prev =>
      prev.map((p, i) => {
        const r = results[i];
        if (r.status === 'fulfilled') {
          if (!modelVersion || modelVersion === '—') setModelVersion(r.value.model_version);
          return { ...p, result: r.value, loading: false, error: false };
        }
        return { ...p, loading: false, error: true };
      })
    );
  }, []);

  // Initial load
  useEffect(() => { runAll(0); }, [runAll]);

  // Debounced re-run on boost change
  const handleBoostChange = (val: number) => {
    setRainfallBoost(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runAll(val), 400);
  };

  const selectedPred = predictions.find(p => p.loc.id === selectedId);

  // Sort by risk descending
  const sorted = [...predictions].sort((a, b) => (b.result?.current_risk ?? 0) - (a.result?.current_risk ?? 0));

  const filtered = sorted.filter(p => {
    if (filterLevel === 'ALL') return true;
    const r = p.result?.current_risk ?? 0;
    if (filterLevel === 'VERY_HIGH') return r >= 85;
    if (filterLevel === 'HIGH')     return r >= 70 && r < 85;
    if (filterLevel === 'MODERATE') return r >= 40 && r < 70;
    if (filterLevel === 'LOW')      return r < 40;
    return true;
  });

  const veryHighCount = predictions.filter(p => (p.result?.current_risk ?? 0) >= 85).length;
  const highCount     = predictions.filter(p => { const r = p.result?.current_risk ?? 0; return r >= 70 && r < 85; }).length;
  const moderateCount = predictions.filter(p => { const r = p.result?.current_risk ?? 0; return r >= 40 && r < 70; }).length;
  const lowCount      = predictions.filter(p => (p.result?.current_risk ?? 0) < 40 && p.result !== null).length;

  return (
    <div className="p-5 h-full overflow-y-auto bg-slate-950 text-slate-200">

      {/* Header */}
      <div className="flex flex-wrap justify-between items-center mb-5 gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Activity className="text-blue-500" size={26} />
            AI Prediction Engine
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-mono">
            {DIMA_HASAO_LOCATIONS.length} monitoring stations · Dima Hasao, Assam · Engine: {modelVersion}
          </p>
        </div>
        <button
          onClick={() => runAll(rainfallBoost)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-[0_0_10px_rgba(59,130,246,0.3)]"
        >
          <Activity size={14} /> Re-run All
        </button>
      </div>

      {/* Storm Simulator Bar */}
      <div className="glass-card rounded-xl p-4 mb-5 border border-white/5">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <Droplets size={16} className="text-blue-400" />
            <span className="text-sm font-bold text-white">Storm Simulator</span>
            <span className="text-xs text-slate-400">(applies extra rainfall to all stations)</span>
          </div>
          <div className="flex-1 min-w-48 flex items-center gap-3">
            <div className="relative flex-1 h-2 bg-slate-800 rounded-full">
              <div className="absolute h-full rounded-full bg-blue-500 transition-all" style={{ width: `${(rainfallBoost / 250) * 100}%` }} />
            </div>
            <input
              type="range" min={0} max={250} step={5} value={rainfallBoost}
              onChange={e => handleBoostChange(parseInt(e.target.value))}
              className="absolute opacity-0 w-48 cursor-pointer h-2"
              style={{ position: 'relative', marginTop: '-8px' }}
            />
            <span className={`text-sm font-black w-16 ${rainfallBoost > 100 ? 'text-red-400' : rainfallBoost > 50 ? 'text-yellow-400' : 'text-blue-400'}`}>
              +{rainfallBoost}mm
            </span>
          </div>
          <div className="flex gap-2 shrink-0">
            {[{ label: '☀️ Clear', val: 0 }, { label: '🌧️ Storm', val: 100 }, { label: '⛈️ Extreme', val: 220 }].map(s => (
              <button key={s.label} onClick={() => handleBoostChange(s.val)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                  rainfallBoost === s.val ? 'bg-blue-600 border-blue-500 text-white shadow-[0_0_10px_rgba(37,99,235,0.3)]' : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
                }`}>{s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Pills + Filter */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        {[
          { level: 'ALL',      label: `All (${DIMA_HASAO_LOCATIONS.length})`, color: 'border-white/10 bg-white/5 text-slate-300' },
          { level: 'VERY_HIGH',label: `🔴 Very High (${veryHighCount})`,      color: 'border-risk-very-high/30 bg-risk-very-high/10 text-risk-very-high' },
          { level: 'HIGH',     label: `🟠 High (${highCount})`,               color: 'border-risk-high/30 bg-risk-high/10 text-risk-high' },
          { level: 'MODERATE', label: `🟡 Moderate (${moderateCount})`,       color: 'border-risk-moderate/30 bg-risk-moderate/10 text-risk-moderate' },
          { level: 'LOW',      label: `🟢 Low (${lowCount})`,                 color: 'border-risk-low/30 bg-risk-low/10 text-risk-low' },
        ].map(f => (
          <button key={f.level} onClick={() => setFilterLevel(f.level as any)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${f.color} ${filterLevel === f.level ? 'ring-2 ring-white/20' : 'opacity-70 hover:opacity-100'}`}>
            {f.label}
          </button>
        ))}
        <span className="ml-auto text-xs text-slate-500 font-mono">sorted by risk ↓</span>
      </div>

      {/* Grid of location cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map(pred => (
          <LocationCard
            key={pred.loc.id}
            pred={pred}
            rainfallBoost={rainfallBoost}
            onClick={() => setSelectedId(pred.loc.id)}
          />
        ))}
      </div>

      {/* Detail modal */}
      {selectedId && selectedPred && (
        <LocationDetailPanel
          pred={selectedPred}
          rainfallBoost={rainfallBoost}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}
