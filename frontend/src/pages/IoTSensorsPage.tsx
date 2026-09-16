import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Wifi, WifiOff, Thermometer, Droplets, Activity, Radio,
  Zap, AlertTriangle, CheckCircle, Clock, RefreshCw, Signal,
  Navigation, Mountain, Layers, Wind
} from 'lucide-react';
import { DIMA_HASAO_LOCATIONS, DemoLocation } from '../data/demoLocations';

// ── Sensor Types ───────────────────────────────────────────────────────────────
interface SensorReading {
  value: number;
  unit: string;
  status: 'ok' | 'warn' | 'critical' | 'offline';
  trend: 'up' | 'down' | 'stable';
  history: number[]; // last 12 readings (sparkline)
}

interface StationSensors {
  rainfall_gauge: SensorReading;
  soil_moisture: SensorReading;
  inclinometer: SensorReading;   // slope angle deviation (mm/m)
  piezometer: SensorReading;     // pore-water pressure (kPa)
  seismometer: SensorReading;    // micro-seismic activity (mGal)
  gps_deformation: SensorReading; // horizontal displacement (mm)
  temperature: SensorReading;
  humidity: SensorReading;
}

interface Station {
  loc: DemoLocation;
  sensors: StationSensors;
  online: boolean;
  lastSync: Date;
  signalStrength: number; // 0-100
  batteryLevel: number;   // 0-100
}

// ── Simulation helpers ─────────────────────────────────────────────────────────
function clamp(v: number, min: number, max: number) { return Math.max(min, Math.min(max, v)); }

function jitter(base: number, spread: number) {
  return base + (Math.random() - 0.5) * 2 * spread;
}

function generateHistory(base: number, spread: number, count = 12): number[] {
  return Array.from({ length: count }, () => Math.round(jitter(base, spread) * 10) / 10);
}

function getTrend(history: number[]): 'up' | 'down' | 'stable' {
  if (history.length < 3) return 'stable';
  const last3 = history.slice(-3);
  const delta = last3[2] - last3[0];
  if (delta > 1) return 'up';
  if (delta < -1) return 'down';
  return 'stable';
}

function buildStations(): Station[] {
  return DIMA_HASAO_LOCATIONS.map((loc) => {
    const isOffline = Math.random() < 0.07; // ~7% chance offline
    const rfHist   = generateHistory(loc.rainfall, 8);
    const smHist   = generateHistory(loc.soil_moisture, 5);
    const inclHist = generateHistory(loc.ground_deformation * 0.3, 1.5);
    const piezHist = generateHistory(loc.soil_moisture * 0.8, 6);
    const seisHist = generateHistory(2 + loc.historical_landslides * 0.4, 0.8);
    const gpsHist  = generateHistory(loc.ground_deformation * 0.5, 2);
    const tempHist = generateHistory(18 + loc.elevation * -0.006, 1.5);
    const humHist  = generateHistory(loc.soil_moisture + 10, 5);

    const rfVal   = Math.round(rfHist[rfHist.length - 1]);
    const smVal   = Math.round(smHist[smHist.length - 1]);
    const inclVal = Math.round(inclHist[inclHist.length - 1] * 10) / 10;
    const piezVal = Math.round(piezHist[piezHist.length - 1] * 10) / 10;
    const seisVal = Math.round(seisHist[seisHist.length - 1] * 100) / 100;
    const gpsVal  = Math.round(gpsHist[gpsHist.length - 1] * 10) / 10;
    const tempVal = Math.round(tempHist[tempHist.length - 1] * 10) / 10;
    const humVal  = Math.round(humHist[humHist.length - 1]);

    return {
      loc,
      online: !isOffline,
      lastSync: new Date(Date.now() - Math.random() * 180_000),
      signalStrength: isOffline ? 0 : Math.round(40 + Math.random() * 60),
      batteryLevel: Math.round(20 + Math.random() * 80),
      sensors: {
        rainfall_gauge: {
          value: rfVal,
          unit: 'mm/h',
          trend: getTrend(rfHist),
          history: rfHist,
          status: rfVal > 80 ? 'critical' : rfVal > 50 ? 'warn' : 'ok',
        },
        soil_moisture: {
          value: smVal,
          unit: '%',
          trend: getTrend(smHist),
          history: smHist,
          status: smVal > 80 ? 'critical' : smVal > 65 ? 'warn' : 'ok',
        },
        inclinometer: {
          value: inclVal,
          unit: 'mm/m',
          trend: getTrend(inclHist),
          history: inclHist,
          status: inclVal > 15 ? 'critical' : inclVal > 8 ? 'warn' : 'ok',
        },
        piezometer: {
          value: piezVal,
          unit: 'kPa',
          trend: getTrend(piezHist),
          history: piezHist,
          status: piezVal > 60 ? 'critical' : piezVal > 40 ? 'warn' : 'ok',
        },
        seismometer: {
          value: seisVal,
          unit: 'mGal',
          trend: getTrend(seisHist),
          history: seisHist,
          status: seisVal > 4 ? 'critical' : seisVal > 2.5 ? 'warn' : 'ok',
        },
        gps_deformation: {
          value: gpsVal,
          unit: 'mm',
          trend: getTrend(gpsHist),
          history: gpsHist,
          status: gpsVal > 20 ? 'critical' : gpsVal > 10 ? 'warn' : 'ok',
        },
        temperature: {
          value: tempVal,
          unit: '°C',
          trend: getTrend(tempHist),
          history: tempHist,
          status: 'ok',
        },
        humidity: {
          value: humVal,
          unit: '%',
          trend: getTrend(humHist),
          history: humHist,
          status: humVal > 90 ? 'warn' : 'ok',
        },
      },
    };
  });
}

function tickStation(s: Station): Station {
  if (!s.online) {
    // small chance to come back online
    if (Math.random() < 0.03) return { ...s, online: true, lastSync: new Date(), signalStrength: Math.round(40 + Math.random() * 60) };
    return s;
  }
  // small chance to go offline
  if (Math.random() < 0.01) return { ...s, online: false, signalStrength: 0 };

  function tickReading(r: SensorReading, spread: number, min: number, max: number, warnT: number, critT: number): SensorReading {
    const newVal = clamp(Math.round((r.value + (Math.random() - 0.48) * spread) * 10) / 10, min, max);
    const newHistory = [...r.history.slice(-11), newVal];
    return {
      value: newVal,
      unit: r.unit,
      trend: getTrend(newHistory),
      history: newHistory,
      status: newVal > critT ? 'critical' : newVal > warnT ? 'warn' : 'ok',
    };
  }

  return {
    ...s,
    lastSync: new Date(),
    signalStrength: clamp(s.signalStrength + Math.round((Math.random() - 0.5) * 10), 20, 100),
    batteryLevel: clamp(s.batteryLevel - (Math.random() < 0.1 ? 1 : 0), 5, 100),
    sensors: {
      rainfall_gauge:   tickReading(s.sensors.rainfall_gauge,   4, 0, 200, 50, 80),
      soil_moisture:    tickReading(s.sensors.soil_moisture,     2, 0, 100, 65, 80),
      inclinometer:     tickReading(s.sensors.inclinometer,      0.5, 0, 50, 8, 15),
      piezometer:       tickReading(s.sensors.piezometer,        2, 0, 120, 40, 60),
      seismometer:      tickReading(s.sensors.seismometer,       0.1, 0, 10, 2.5, 4),
      gps_deformation:  tickReading(s.sensors.gps_deformation,   0.3, 0, 60, 10, 20),
      temperature:      tickReading(s.sensors.temperature,       0.2, -5, 40, 999, 999),
      humidity:         tickReading(s.sensors.humidity,          1.5, 0, 100, 90, 999),
    },
  };
}

// ── Status colours ─────────────────────────────────────────────────────────────
const STATUS_STYLES = {
  ok:       { dot: 'bg-risk-low',  text: 'text-risk-low',  badge: 'bg-risk-low/10 border-risk-low/30 text-risk-low' },
  warn:     { dot: 'bg-risk-moderate', text: 'text-risk-moderate', badge: 'bg-risk-moderate/10 border-risk-moderate/30 text-risk-moderate' },
  critical: { dot: 'bg-risk-very-high',    text: 'text-risk-very-high',    badge: 'bg-risk-very-high/10 border-risk-very-high/30 text-risk-very-high' },
  offline:  { dot: 'bg-slate-700',  text: 'text-slate-500',  badge: 'bg-slate-800/50 border-slate-700 text-slate-500' },
};

const TREND_ICON: Record<string, string> = { up: '↑', down: '↓', stable: '→' };
const TREND_COLOR: Record<string, string> = { up: 'text-risk-very-high', down: 'text-risk-low', stable: 'text-slate-500' };

// ── Sparkline (inline SVG) ─────────────────────────────────────────────────────
function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (!data.length) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const w = 60, h = 20;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="shrink-0">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

// ── Single Sensor Cell ─────────────────────────────────────────────────────────
function SensorCell({
  label, icon, reading, sparkColor,
}: {
  label: string;
  icon: React.ReactNode;
  reading: SensorReading | null;
  sparkColor: string;
}) {
  const r = reading;
  const s = r ? STATUS_STYLES[r.status] : STATUS_STYLES.offline;
  return (
    <div className={`rounded-lg p-2 border bg-slate-900/50 border-slate-800 flex flex-col gap-1 min-w-0`}>
      <div className="flex items-center gap-1 text-slate-400 text-[10px] font-semibold uppercase tracking-wide">
        <span className="shrink-0">{icon}</span>
        <span className="truncate">{label}</span>
      </div>
      {r ? (
        <>
          <div className="flex items-end justify-between gap-1">
            <span className={`text-sm font-black ${s.text}`}>
              {r.value}<span className="text-[10px] font-normal text-slate-600 ml-0.5">{r.unit}</span>
            </span>
            <span className={`text-[10px] font-bold ${TREND_COLOR[r.trend]}`}>{TREND_ICON[r.trend]}</span>
          </div>
          <Sparkline data={r.history} color={sparkColor} />
        </>
      ) : (
        <span className="text-xs text-slate-600 font-mono">OFFLINE</span>
      )}
    </div>
  );
}

// ── Station Card ───────────────────────────────────────────────────────────────
function StationCard({ station, onClick }: { station: Station; onClick: () => void }) {
  const { loc, sensors, online, lastSync, signalStrength, batteryLevel } = station;

  const criticalCount = online
    ? Object.values(sensors).filter(s => s.status === 'critical').length : 0;
  const warnCount = online
    ? Object.values(sensors).filter(s => s.status === 'warn').length : 0;

  const overallStatus: 'ok' | 'warn' | 'critical' | 'offline' =
    !online ? 'offline' : criticalCount > 0 ? 'critical' : warnCount > 0 ? 'warn' : 'ok';
  const ss = STATUS_STYLES[overallStatus];

  const secAgo = Math.round((Date.now() - lastSync.getTime()) / 1000);
  const syncLabel = secAgo < 60 ? `${secAgo}s ago` : `${Math.round(secAgo / 60)}m ago`;

  return (
    <button
      onClick={onClick}
      className={`w-full text-left glass-card rounded-2xl p-4 transition-all duration-300 hover:scale-[1.015] hover:shadow-xl group
        ${overallStatus === 'critical' ? 'border-risk-very-high/30 bg-risk-very-high/5 shadow-[0_0_20px_rgba(239,68,68,0.15)]' :
          overallStatus === 'warn'     ? 'border-risk-moderate/30 bg-risk-moderate/5 shadow-[0_0_15px_rgba(234,179,8,0.1)]' :
          overallStatus === 'offline'  ? 'border-slate-800 bg-slate-900/30 opacity-70' :
                                         'border-white/5 opacity-80'}`}
    >
      {/* Header row */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full shrink-0 ${ss.dot} ${overallStatus !== 'offline' && overallStatus !== 'ok' ? 'animate-pulse' : ''}`} />
            <p className="font-black text-white text-sm group-hover:text-cyan-400 transition-colors">{loc.name}</p>
          </div>
          <p className="text-[10px] text-slate-400 font-mono mt-0.5 ml-4">
            {loc.lat.toFixed(3)}°N, {loc.lon.toFixed(3)}°E · {loc.elevation}m
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${ss.badge}`}>
            {online ? overallStatus.toUpperCase() : 'OFFLINE'}
          </span>
          {online && (
            <div className="flex items-center gap-1 text-[10px] text-slate-600">
              <Clock size={9} /> {syncLabel}
            </div>
          )}
        </div>
      </div>

      {/* Signal + battery row */}
      <div className="flex items-center gap-3 mb-3">
        <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
          {online ? <Signal size={11} className="text-green-500" /> : <WifiOff size={11} className="text-slate-600" />}
          <span>{online ? `${signalStrength}%` : 'No signal'}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
          <Zap size={10} className={batteryLevel < 20 ? 'text-red-500' : 'text-yellow-500'} />
          <span>{batteryLevel}%</span>
        </div>
        <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${batteryLevel < 20 ? 'bg-red-500' : batteryLevel < 50 ? 'bg-yellow-500' : 'bg-green-500'}`}
            style={{ width: `${batteryLevel}%` }}
          />
        </div>
      </div>

      {/* Sensor mini-grid */}
      {online ? (
        <div className="grid grid-cols-4 gap-1.5">
          <SensorCell label="Rain"     icon={<Droplets size={9} />}   reading={sensors.rainfall_gauge}  sparkColor="#3b82f6" />
          <SensorCell label="Moisture" icon={<Wind size={9} />}       reading={sensors.soil_moisture}   sparkColor="#10b981" />
          <SensorCell label="Tilt"     icon={<Navigation size={9} />} reading={sensors.inclinometer}    sparkColor="#f59e0b" />
          <SensorCell label="Pore P."  icon={<Layers size={9} />}     reading={sensors.piezometer}      sparkColor="#6366f1" />
          <SensorCell label="Seismic"  icon={<Activity size={9} />}   reading={sensors.seismometer}     sparkColor="#ec4899" />
          <SensorCell label="GPS Def." icon={<Radio size={9} />}      reading={sensors.gps_deformation} sparkColor="#a855f7" />
          <SensorCell label="Temp"     icon={<Thermometer size={9} />}reading={sensors.temperature}     sparkColor="#f97316" />
          <SensorCell label="Humidity" icon={<Droplets size={9} />}   reading={sensors.humidity}        sparkColor="#22d3ee" />
        </div>
      ) : (
        <div className="flex items-center justify-center h-16 border border-slate-800 rounded-xl bg-slate-900/50">
          <div className="text-center">
            <WifiOff size={18} className="text-slate-600 mx-auto mb-1" />
            <p className="text-xs text-slate-500 font-mono">STATION UNREACHABLE</p>
          </div>
        </div>
      )}

      {criticalCount > 0 && (
        <div className="mt-2.5 flex items-center gap-1.5 text-[10px] text-red-400 bg-red-900/20 border border-red-900/40 rounded-lg px-2 py-1">
          <AlertTriangle size={10} /> {criticalCount} sensor{criticalCount > 1 ? 's' : ''} critical
        </div>
      )}

      <p className="text-[10px] text-slate-700 mt-2 group-hover:text-slate-600 transition-colors">Click for detailed view →</p>
    </button>
  );
}

// ── Station Detail Modal ───────────────────────────────────────────────────────
function StationDetailModal({
  station,
  onClose,
}: {
  station: Station;
  onClose: () => void;
}) {
  const { loc, sensors, online, lastSync, signalStrength, batteryLevel } = station;

  const SENSOR_CONFIG: {
    key: keyof StationSensors;
    label: string;
    icon: React.ReactNode;
    color: string;
    description: string;
    minSafe: number;
    maxSafe: number;
  }[] = [
    { key: 'rainfall_gauge',   label: 'Tipping Bucket Rain Gauge',    icon: <Droplets size={14} />,    color: '#3b82f6',  description: 'Measures precipitation intensity in mm/hour',         minSafe: 0,  maxSafe: 50  },
    { key: 'soil_moisture',    label: 'TDR Soil Moisture Probe',      icon: <Wind size={14} />,        color: '#10b981',  description: 'Volumetric water content via time-domain reflectometry', minSafe: 20, maxSafe: 65  },
    { key: 'inclinometer',     label: 'Vibrating Wire Inclinometer',  icon: <Navigation size={14} />,  color: '#f59e0b',  description: 'Slope deformation angle — deviation from baseline',    minSafe: 0,  maxSafe: 8   },
    { key: 'piezometer',       label: 'Standpipe Piezometer',         icon: <Layers size={14} />,      color: '#6366f1',  description: 'Pore-water pressure within the soil profile (kPa)',    minSafe: 0,  maxSafe: 40  },
    { key: 'seismometer',      label: 'MEMS Micro-Seismometer',       icon: <Activity size={14} />,    color: '#ec4899',  description: 'Micro-seismic ground vibration (milli-Gal)',           minSafe: 0,  maxSafe: 2.5 },
    { key: 'gps_deformation',  label: 'GNSS Ground Displacement',     icon: <Radio size={14} />,       color: '#a855f7',  description: 'Horizontal surface displacement from reference point',  minSafe: 0,  maxSafe: 10  },
    { key: 'temperature',      label: 'Soil Temperature Sensor',      icon: <Thermometer size={14} />, color: '#f97316',  description: 'Near-surface soil temperature (°C)',                   minSafe: 0,  maxSafe: 35  },
    { key: 'humidity',         label: 'Capacitive Humidity Sensor',   icon: <Droplets size={14} />,    color: '#22d3ee',  description: 'Relative humidity of ambient air (%)',                 minSafe: 0,  maxSafe: 90  },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="glass-panel rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            {online
              ? <Wifi size={20} className="text-green-400" />
              : <WifiOff size={20} className="text-slate-400" />}
            <div>
              <h2 className="text-xl font-black text-white">{loc.name} Monitoring Station</h2>
              <p className="text-xs text-slate-400 font-mono">
                {loc.lat.toFixed(4)}°N, {loc.lon.toFixed(4)}°E · {loc.elevation}m elev. · Dima Hasao, Assam
              </p>
            </div>
            <span className={`ml-2 text-xs font-bold px-2 py-1 rounded-full border ${online ? 'bg-green-900/30 border-green-700/50 text-green-400' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
              {online ? '● ONLINE' : '○ OFFLINE'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Station meta */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Signal Strength', val: online ? `${signalStrength}%` : 'None', icon: <Signal size={12} />, color: signalStrength > 60 ? 'text-green-400' : signalStrength > 30 ? 'text-yellow-400' : 'text-red-400' },
              { label: 'Battery Level',   val: `${batteryLevel}%`, icon: <Zap size={12} />, color: batteryLevel < 20 ? 'text-red-500' : batteryLevel < 50 ? 'text-yellow-500' : 'text-green-500' },
              { label: 'Last Sync',       val: `${Math.round((Date.now() - lastSync.getTime()) / 1000)}s ago`, icon: <Clock size={12} />, color: 'text-slate-600' },
              { label: 'Elevation',       val: `${loc.elevation}m`, icon: <Mountain size={12} />, color: 'text-slate-400' },
            ].map(m => (
              <div key={m.label} className="glass-card rounded-xl p-3">
                <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-semibold uppercase tracking-wider mb-1">
                  {m.icon} {m.label}
                </div>
                <p className={`text-lg font-black ${m.color}`}>{m.val}</p>
              </div>
            ))}
          </div>

          {/* Sensor readings */}
          <div className="glass-card rounded-xl p-5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Activity size={12} className="text-blue-400" /> Sensor Readings
            </h3>
            <div className="space-y-2">
              {SENSOR_CONFIG.map(cfg => {
                const r: SensorReading = sensors[cfg.key];
                const pct = Math.min(100, (r.value / (cfg.maxSafe * 1.5)) * 100);
                const ss = STATUS_STYLES[online ? r.status : 'offline'];
                return (
                  <div key={cfg.key} className={`bg-slate-900/50 border rounded-xl p-3 ${online && r.status === 'critical' ? 'border-red-500/50 bg-red-900/10' : online && r.status === 'warn' ? 'border-yellow-500/50 bg-yellow-900/10' : 'border-slate-800'}`}>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span style={{ color: cfg.color }}>{cfg.icon}</span>
                        <div>
                          <p className="text-xs font-bold text-slate-200">{cfg.label}</p>
                          <p className="text-[10px] text-slate-400">{cfg.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {online && (
                          <>
                            <span className={`text-[10px] font-bold ${TREND_COLOR[r.trend]}`}>
                              {TREND_ICON[r.trend]}
                            </span>
                            <Sparkline data={r.history} color={cfg.color} />
                          </>
                        )}
                        <div className="text-right">
                          <p className={`text-lg font-black ${ss.text}`}>
                            {online ? r.value : '—'}
                            <span className="text-[10px] font-normal text-slate-600 ml-0.5">{r.unit}</span>
                          </p>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${ss.badge}`}>
                            {online ? r.status.toUpperCase() : 'OFFLINE'}
                          </span>
                        </div>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="relative h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="absolute h-full rounded-full transition-all duration-500"
                        style={{ width: online ? `${pct}%` : '0%', backgroundColor: cfg.color, opacity: online ? 0.85 : 0.3 }}
                      />
                      {/* safe zone marker */}
                      <div
                        className="absolute h-full w-px bg-yellow-500/50"
                        style={{ left: `${(cfg.maxSafe / (cfg.maxSafe * 1.5)) * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[9px] text-slate-500 mt-0.5 font-medium">
                      <span>0 {r.unit}</span>
                      <span className="text-yellow-600">⚠ {cfg.maxSafe} {r.unit}</span>
                      <span>{(cfg.maxSafe * 1.5).toFixed(0)} {r.unit}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Simulation note */}
          <div className="bg-cyan-900/20 border border-cyan-800/50 rounded-xl p-3 flex items-start gap-2">
            <CheckCircle size={14} className="text-cyan-400 shrink-0 mt-0.5" />
            <p className="text-xs text-cyan-200/80">
              <span className="font-bold text-cyan-400">Simulated Hardware.</span>{' '}
              These readings are generated by a physics-informed simulation engine seeded from the Dima Hasao geodata, rainfall models, and real-world slope parameters. In a deployment scenario, this panel would display live telemetry from physical IoT sensor nodes installed on-site.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function IoTSensorsPage() {
  const [stations, setStations] = useState<Station[]>(() => buildStations());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'CRITICAL' | 'WARN' | 'OK' | 'OFFLINE'>('ALL');
  const [isPaused, setIsPaused] = useState(false);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const tick = useCallback(() => {
    setStations(prev => prev.map(tickStation));
  }, []);

  useEffect(() => {
    if (!isPaused) {
      tickRef.current = setInterval(tick, 2000);
    }
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [isPaused, tick]);

  const selectedStation = stations.find(s => s.loc.id === selectedId);

  // Stats
  const online     = stations.filter(s => s.online).length;
  const critical   = stations.filter(s => s.online && Object.values(s.sensors).some(r => r.status === 'critical')).length;
  const warning    = stations.filter(s => s.online && !Object.values(s.sensors).some(r => r.status === 'critical') && Object.values(s.sensors).some(r => r.status === 'warn')).length;
  const totalSensors = stations.length * 8;
  const onlineSensors = stations.filter(s => s.online).length * 8;

  const filtered = stations.filter(s => {
    if (filterStatus === 'ALL') return true;
    if (filterStatus === 'OFFLINE') return !s.online;
    if (filterStatus === 'CRITICAL') return s.online && Object.values(s.sensors).some(r => r.status === 'critical');
    if (filterStatus === 'WARN')     return s.online && !Object.values(s.sensors).some(r => r.status === 'critical') && Object.values(s.sensors).some(r => r.status === 'warn');
    if (filterStatus === 'OK')       return s.online && Object.values(s.sensors).every(r => r.status === 'ok');
    return true;
  });

  return (
    <div className="p-5 h-full overflow-y-auto bg-slate-950 text-slate-200">

      {/* ── Header ── */}
      <div className="flex flex-wrap justify-between items-start mb-5 gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Wifi className="text-cyan-400" size={26} />
            IoT Sensor Network
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-mono">
            {stations.length} monitoring stations · {totalSensors} sensors deployed · Dima Hasao, Assam · Live simulation
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setStations(buildStations())}
            className="flex items-center gap-2 bg-slate-900/50 hover:bg-slate-800 border border-slate-700 px-3 py-2 rounded-lg text-xs font-bold transition-colors text-slate-300"
          >
            <RefreshCw size={12} /> Reset Sim
          </button>
          <button
            onClick={() => setIsPaused(p => !p)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-colors border ${
              isPaused
                ? 'bg-yellow-900/30 border-yellow-700/50 text-yellow-400 hover:bg-yellow-900/50'
                : 'bg-cyan-900/30 border-cyan-700/50 text-cyan-400 hover:bg-cyan-900/50'
            }`}
          >
            {isPaused ? <><Zap size={12} /> Resume</> : <><Activity size={12} /> Pause</>}
          </button>
        </div>
      </div>

      {/* ── Status Bar ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Online Stations',   val: `${online}/${stations.length}`, icon: <CheckCircle size={14} />, color: 'text-risk-low', bg: 'border-risk-low/30 bg-risk-low/10' },
          { label: 'Critical Alerts',   val: critical, icon: <AlertTriangle size={14} />, color: 'text-risk-very-high',   bg: 'border-risk-very-high/30 bg-risk-very-high/10' },
          { label: 'Warnings',          val: warning,  icon: <Zap size={14} />,           color: 'text-risk-moderate', bg: 'border-risk-moderate/30 bg-risk-moderate/10' },
          { label: 'Active Sensors',    val: `${onlineSensors}/${totalSensors}`, icon: <Radio size={14} />, color: 'text-cyan-400', bg: 'border-cyan-400/30 bg-cyan-400/10' },
        ].map(m => (
          <div key={m.label} className={`glass-card rounded-xl p-4 border ${m.bg}`}>
            <div className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-wide mb-1 ${m.color}`}>
              {m.icon} {m.label}
            </div>
            <p className={`text-3xl font-black ${m.color}`}>{m.val}</p>
          </div>
        ))}
      </div>

      {/* ── Sensor type legend ── */}
      <div className="glass-card rounded-xl p-3 mb-5">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Simulated Sensor Types per Station</p>
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Tipping-Bucket Rain Gauge',   color: '#3b82f6' },
            { label: 'TDR Soil Moisture Probe',     color: '#10b981' },
            { label: 'Vibrating-Wire Inclinometer', color: '#f59e0b' },
            { label: 'Standpipe Piezometer',        color: '#6366f1' },
            { label: 'MEMS Micro-Seismometer',      color: '#ec4899' },
            { label: 'GNSS Displacement (GPS)',     color: '#a855f7' },
            { label: 'Soil Temperature Sensor',     color: '#f97316' },
            { label: 'Capacitive Humidity Sensor',  color: '#22d3ee' },
          ].map(t => (
            <div key={t.label} className="flex items-center gap-1.5 text-[10px] text-slate-300 bg-slate-900/50 px-2 py-1 rounded-lg border border-slate-800">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: t.color }} />
              {t.label}
            </div>
          ))}
        </div>
      </div>

      {/* ── Filter Pills ── */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        {([
          ['ALL',      `All (${stations.length})`,        'border-white/10 bg-white/5 text-slate-300'],
          ['CRITICAL', `🔴 Critical (${critical})`,       'border-risk-very-high/30 bg-risk-very-high/10 text-risk-very-high'],
          ['WARN',     `🟡 Warning (${warning})`,         'border-risk-moderate/30 bg-risk-moderate/10 text-risk-moderate'],
          ['OK',       `🟢 Normal (${stations.filter(s => s.online && Object.values(s.sensors).every(r => r.status === 'ok')).length})`, 'border-risk-low/30 bg-risk-low/10 text-risk-low'],
          ['OFFLINE',  `⚫ Offline (${stations.length - online})`, 'border-slate-700 bg-slate-800/50 text-slate-400'],
        ] as [typeof filterStatus, string, string][]).map(([level, label, cls]) => (
          <button
            key={level}
            onClick={() => setFilterStatus(level)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${cls} ${filterStatus === level ? 'ring-2 ring-white/20' : 'opacity-70 hover:opacity-100'}`}
          >
            {label}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-1.5 text-[10px] text-slate-600 font-mono">
          <div className={`w-1.5 h-1.5 rounded-full ${isPaused ? 'bg-yellow-500' : 'bg-green-500 animate-pulse'}`} />
          {isPaused ? 'PAUSED' : 'LIVE · updates every 2s'}
        </div>
      </div>

      {/* ── Station Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map(station => (
          <StationCard
            key={station.loc.id}
            station={station}
            onClick={() => setSelectedId(station.loc.id)}
          />
        ))}
      </div>

      {/* ── Detail Modal ── */}
      {selectedId && selectedStation && (
        <StationDetailModal
          station={selectedStation}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}
