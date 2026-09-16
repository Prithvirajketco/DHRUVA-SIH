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

// ── Sensor Cell ─────────────────────────────────────────────────────────
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
    <div className={`rounded-xl p-2.5 border bg-slate-50 border-slate-100 flex flex-col gap-1.5 min-w-0 shadow-sm`}>
      <div className="flex items-center gap-1 text-slate-500 text-[10px] font-extrabold uppercase tracking-wide">
        <span className="shrink-0">{icon}</span>
        <span className="truncate">{label}</span>
      </div>
      {r ? (
        <>
          <div className="flex items-end justify-between gap-1">
            <span className={`text-sm font-black text-[#1E293B]`}>
              {r.value}<span className="text-[10px] font-bold text-slate-400 ml-0.5">{r.unit}</span>
            </span>
            <span className={`text-[10px] font-black ${TREND_COLOR[r.trend]}`}>{TREND_ICON[r.trend]}</span>
          </div>
          <Sparkline data={r.history} color={sparkColor} />
        </>
      ) : (
        <span className="text-xs text-slate-400 font-bold mt-2">OFFLINE</span>
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
      className={`w-full text-left bg-white rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-soft-lg group border
        ${overallStatus === 'critical' ? 'border-red-200 shadow-[0_4px_20px_rgba(239,68,68,0.1)]' :
          overallStatus === 'warn'     ? 'border-yellow-200 shadow-[0_4px_20px_rgba(234,179,8,0.08)]' :
          overallStatus === 'offline'  ? 'border-slate-200 bg-slate-50 opacity-80' :
                                         'border-slate-100 shadow-soft'}`}
    >
      {/* Header row */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${ss.dot} shadow-sm ${overallStatus !== 'offline' && overallStatus !== 'ok' ? 'animate-pulse' : ''}`} />
            <p className="font-extrabold text-[#1E293B] text-base group-hover:text-blue-600 transition-colors">{loc.name}</p>
          </div>
          <p className="text-[10px] text-slate-400 font-bold mt-1 ml-4">
            {loc.lat.toFixed(3)}°N, {loc.lon.toFixed(3)}°E · {loc.elevation}m
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${ss.badge}`}>
            {online ? overallStatus.toUpperCase() : 'OFFLINE'}
          </span>
          {online && (
            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
              <Clock size={10} /> {syncLabel}
            </div>
          )}
        </div>
      </div>

      {/* Signal + battery row */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
          {online ? <Signal size={12} className="text-green-500" /> : <WifiOff size={12} className="text-slate-400" />}
          <span>{online ? `${signalStrength}%` : 'No signal'}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
          <Zap size={12} className={batteryLevel < 20 ? 'text-red-500' : 'text-yellow-500'} />
          <span>{batteryLevel}%</span>
        </div>
        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
          <div
            className={`h-full rounded-full transition-all duration-300 ${batteryLevel < 20 ? 'bg-red-500' : batteryLevel < 50 ? 'bg-yellow-500' : 'bg-green-500'}`}
            style={{ width: `${batteryLevel}%` }}
          />
        </div>
      </div>

      {/* Sensor mini-grid */}
      {online ? (
        <div className="grid grid-cols-4 gap-2">
          <SensorCell label="Rain"     icon={<Droplets size={10} />}   reading={sensors.rainfall_gauge}  sparkColor="#3b82f6" />
          <SensorCell label="Moisture" icon={<Wind size={10} />}       reading={sensors.soil_moisture}   sparkColor="#10b981" />
          <SensorCell label="Tilt"     icon={<Navigation size={10} />} reading={sensors.inclinometer}    sparkColor="#f59e0b" />
          <SensorCell label="Pore P."  icon={<Layers size={10} />}     reading={sensors.piezometer}      sparkColor="#6366f1" />
          <SensorCell label="Seismic"  icon={<Activity size={10} />}   reading={sensors.seismometer}     sparkColor="#ec4899" />
          <SensorCell label="GPS Def." icon={<Radio size={10} />}      reading={sensors.gps_deformation} sparkColor="#a855f7" />
          <SensorCell label="Temp"     icon={<Thermometer size={10} />}reading={sensors.temperature}     sparkColor="#f97316" />
          <SensorCell label="Humidity" icon={<Droplets size={10} />}   reading={sensors.humidity}        sparkColor="#06b6d4" />
        </div>
      ) : (
        <div className="flex items-center justify-center h-20 border border-slate-200 rounded-xl bg-slate-50/50">
          <div className="text-center text-slate-400">
            <WifiOff size={20} className="mx-auto mb-1.5 opacity-50" />
            <p className="text-[10px] font-extrabold tracking-widest uppercase">Station Unreachable</p>
          </div>
        </div>
      )}

      {criticalCount > 0 && (
        <div className="mt-4 flex items-center gap-2 text-xs font-bold text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
          <AlertTriangle size={14} /> {criticalCount} sensor{criticalCount > 1 ? 's' : ''} critical
        </div>
      )}

      <p className="text-[11px] font-bold text-slate-400 mt-4 group-hover:text-blue-500 transition-colors">Click for detailed view →</p>
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
    { key: 'rainfall_gauge',   label: 'Tipping Bucket Rain Gauge',    icon: <Droplets size={16} />,    color: '#3b82f6',  description: 'Measures precipitation intensity in mm/hour',         minSafe: 0,  maxSafe: 50  },
    { key: 'soil_moisture',    label: 'TDR Soil Moisture Probe',      icon: <Wind size={16} />,        color: '#10b981',  description: 'Volumetric water content via time-domain reflectometry', minSafe: 20, maxSafe: 65  },
    { key: 'inclinometer',     label: 'Vibrating Wire Inclinometer',  icon: <Navigation size={16} />,  color: '#f59e0b',  description: 'Slope deformation angle — deviation from baseline',    minSafe: 0,  maxSafe: 8   },
    { key: 'piezometer',       label: 'Standpipe Piezometer',         icon: <Layers size={16} />,      color: '#6366f1',  description: 'Pore-water pressure within the soil profile (kPa)',    minSafe: 0,  maxSafe: 40  },
    { key: 'seismometer',      label: 'MEMS Micro-Seismometer',       icon: <Activity size={16} />,    color: '#ec4899',  description: 'Micro-seismic ground vibration (milli-Gal)',           minSafe: 0,  maxSafe: 2.5 },
    { key: 'gps_deformation',  label: 'GNSS Ground Displacement',     icon: <Radio size={16} />,       color: '#a855f7',  description: 'Horizontal surface displacement from reference point',  minSafe: 0,  maxSafe: 10  },
    { key: 'temperature',      label: 'Soil Temperature Sensor',      icon: <Thermometer size={16} />, color: '#f97316',  description: 'Near-surface soil temperature (°C)',                   minSafe: 0,  maxSafe: 35  },
    { key: 'humidity',         label: 'Capacitive Humidity Sensor',   icon: <Droplets size={16} />,    color: '#06b6d4',  description: 'Relative humidity of ambient air (%)',                 minSafe: 0,  maxSafe: 90  },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.1)] w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            {online
              ? <Wifi size={24} className="text-green-500" />
              : <WifiOff size={24} className="text-slate-400" />}
            <div>
              <h2 className="text-2xl font-extrabold text-[#1E293B] tracking-tight">{loc.name} Monitoring Station</h2>
              <p className="text-xs text-slate-500 font-semibold mt-1">
                {loc.lat.toFixed(4)}°N, {loc.lon.toFixed(4)}°E · {loc.elevation}m elev. · Dima Hasao, Assam
              </p>
            </div>
            <span className={`ml-4 text-xs font-bold px-3 py-1.5 rounded-full border ${online ? 'bg-green-50 border-green-200 text-green-600' : 'bg-slate-100 border-slate-200 text-slate-500'}`}>
              {online ? '● ONLINE' : '○ OFFLINE'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors text-slate-500"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Station meta */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Signal Strength', val: online ? `${signalStrength}%` : 'None', icon: <Signal size={14} />, color: signalStrength > 60 ? 'text-green-600' : signalStrength > 30 ? 'text-yellow-600' : 'text-red-600', bg: 'bg-slate-50' },
              { label: 'Battery Level',   val: `${batteryLevel}%`, icon: <Zap size={14} />, color: batteryLevel < 20 ? 'text-red-600' : batteryLevel < 50 ? 'text-yellow-600' : 'text-green-600', bg: 'bg-slate-50' },
              { label: 'Last Sync',       val: `${Math.round((Date.now() - lastSync.getTime()) / 1000)}s ago`, icon: <Clock size={14} />, color: 'text-[#1E293B]', bg: 'bg-slate-50' },
              { label: 'Elevation',       val: `${loc.elevation}m`, icon: <Mountain size={14} />, color: 'text-[#1E293B]', bg: 'bg-slate-50' },
            ].map(m => (
              <div key={m.label} className={`rounded-xl p-4 border border-slate-100 ${m.bg}`}>
                <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
                  {m.icon} {m.label}
                </div>
                <p className={`text-xl font-black ${m.color}`}>{m.val}</p>
              </div>
            ))}
          </div>

          {/* Sensor readings */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-soft">
            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Activity size={16} className="text-blue-500" /> Live Sensor Telemetry
            </h3>
            <div className="space-y-3">
              {SENSOR_CONFIG.map(cfg => {
                const r: SensorReading = sensors[cfg.key];
                const pct = Math.min(100, (r.value / (cfg.maxSafe * 1.5)) * 100);
                const ss = STATUS_STYLES[online ? r.status : 'offline'];
                return (
                  <div key={cfg.key} className={`bg-white border rounded-xl p-4 shadow-sm ${online && r.status === 'critical' ? 'border-red-200 bg-red-50/30' : online && r.status === 'warn' ? 'border-yellow-200 bg-yellow-50/30' : 'border-slate-100'}`}>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg" style={{ backgroundColor: `${cfg.color}15`, color: cfg.color }}>
                          {cfg.icon}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#1E293B]">{cfg.label}</p>
                          <p className="text-[11px] font-semibold text-slate-400">{cfg.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        {online && (
                          <>
                            <span className={`text-[11px] font-black ${TREND_COLOR[r.trend]}`}>
                              {TREND_ICON[r.trend]}
                            </span>
                            <Sparkline data={r.history} color={cfg.color} />
                          </>
                        )}
                        <div className="text-right">
                          <p className={`text-xl font-black ${ss.text}`}>
                            {online ? r.value : '—'}
                            <span className="text-xs font-bold text-slate-400 ml-1">{r.unit}</span>
                          </p>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border mt-1 inline-block ${ss.badge}`}>
                            {online ? r.status.toUpperCase() : 'OFFLINE'}
                          </span>
                        </div>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                      <div
                        className="absolute h-full rounded-full transition-all duration-500"
                        style={{ width: online ? `${pct}%` : '0%', backgroundColor: cfg.color, opacity: online ? 1 : 0.2 }}
                      />
                      {/* safe zone marker */}
                      <div
                        className="absolute h-full w-[2px] bg-yellow-500"
                        style={{ left: `${(cfg.maxSafe / (cfg.maxSafe * 1.5)) * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-1.5">
                      <span>0 {r.unit}</span>
                      <span className="text-yellow-600">⚠ Safe limit: {cfg.maxSafe} {r.unit}</span>
                      <span>{(cfg.maxSafe * 1.5).toFixed(0)} {r.unit}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Simulation note */}
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-start gap-3 shadow-sm">
            <CheckCircle size={18} className="text-blue-500 shrink-0 mt-0.5" />
            <p className="text-xs font-semibold text-blue-900/70 leading-relaxed">
              <span className="font-extrabold text-blue-600">Simulated Hardware.</span>{' '}
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
    <div className="p-8 h-full overflow-y-auto bg-[#F4F5F7] text-[#1E293B]">

      {/* ── Header ── */}
      <div className="flex flex-wrap justify-between items-start mb-8 gap-3">
        <div>
          <h1 className="text-3xl font-extrabold text-[#1E293B] flex items-center gap-3 tracking-tight">
            <Wifi className="text-blue-500" size={32} />
            IoT Sensor Network
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-semibold">
            {stations.length} monitoring stations · {totalSensors} sensors deployed · Dima Hasao, Assam · Live simulation
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setStations(buildStations())}
            className="flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-bold transition-all text-slate-600 shadow-sm"
          >
            <RefreshCw size={14} /> Reset Sim
          </button>
          <button
            onClick={() => setIsPaused(p => !p)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm ${
              isPaused
                ? 'bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100'
                : 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
            }`}
          >
            {isPaused ? <><Zap size={14} /> Resume</> : <><Activity size={14} /> Pause</>}
          </button>
        </div>
      </div>

      {/* ── Status Bar ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Online Stations',   val: `${online}/${stations.length}`, icon: <CheckCircle size={16} />, color: 'text-green-600', bg: 'border-green-100 bg-green-50' },
          { label: 'Critical Alerts',   val: critical, icon: <AlertTriangle size={16} />, color: 'text-red-600',   bg: 'border-red-100 bg-red-50' },
          { label: 'Warnings',          val: warning,  icon: <Zap size={16} />,           color: 'text-yellow-600', bg: 'border-yellow-100 bg-yellow-50' },
          { label: 'Active Sensors',    val: `${onlineSensors}/${totalSensors}`, icon: <Radio size={16} />, color: 'text-blue-600', bg: 'border-blue-100 bg-blue-50' },
        ].map(m => (
          <div key={m.label} className={`rounded-2xl p-5 border ${m.bg}`}>
            <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-2 ${m.color}`}>
              {m.icon} {m.label}
            </div>
            <p className={`text-4xl font-black ${m.color}`}>{m.val}</p>
          </div>
        ))}
      </div>

      {/* ── Sensor type legend ── */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 mb-8 shadow-soft">
        <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-3">Simulated Sensor Types per Station</p>
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Tipping-Bucket Rain Gauge',   color: '#3b82f6' },
            { label: 'TDR Soil Moisture Probe',     color: '#10b981' },
            { label: 'Vibrating-Wire Inclinometer', color: '#f59e0b' },
            { label: 'Standpipe Piezometer',        color: '#6366f1' },
            { label: 'MEMS Micro-Seismometer',      color: '#ec4899' },
            { label: 'GNSS Displacement (GPS)',     color: '#a855f7' },
            { label: 'Soil Temperature Sensor',     color: '#f97316' },
            { label: 'Capacitive Humidity Sensor',  color: '#06b6d4' },
          ].map(t => (
            <div key={t.label} className="flex items-center gap-2 text-[11px] font-semibold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
              <div className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: t.color }} />
              {t.label}
            </div>
          ))}
        </div>
      </div>

      {/* ── Filter Pills ── */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        {([
          ['ALL',      `All (${stations.length})`,        'border-slate-200 bg-white text-slate-600'],
          ['CRITICAL', `🔴 Critical (${critical})`,       'border-red-200 bg-red-50 text-red-600'],
          ['WARN',     `🟡 Warning (${warning})`,         'border-yellow-200 bg-yellow-50 text-yellow-600'],
          ['OK',       `🟢 Normal (${stations.filter(s => s.online && Object.values(s.sensors).every(r => r.status === 'ok')).length})`, 'border-green-200 bg-green-50 text-green-600'],
          ['OFFLINE',  `⚫ Offline (${stations.length - online})`, 'border-slate-200 bg-slate-100 text-slate-500'],
        ] as [typeof filterStatus, string, string][]).map(([level, label, cls]) => (
          <button
            key={level}
            onClick={() => setFilterStatus(level)}
            className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${cls} ${filterStatus === level ? 'shadow-sm ring-2 ring-slate-200 ring-offset-1' : 'opacity-70 hover:opacity-100 bg-transparent'}`}
          >
            {label}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2 text-[11px] font-bold text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-lg">
          <div className={`w-2 h-2 rounded-full ${isPaused ? 'bg-yellow-500' : 'bg-green-500 animate-pulse'}`} />
          {isPaused ? 'PAUSED' : 'LIVE · updates every 2s'}
        </div>
      </div>

      {/* ── Station Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
