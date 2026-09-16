import React, { useState } from 'react';
import { Search, Bell, Maximize2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { MapContainer, TileLayer } from 'react-leaflet';
import RiskGauge from '../components/RiskGauge';
import StatPill from '../components/StatPill';
import MetricCard from '../components/MetricCard';
import AlertFeedItem from '../components/AlertFeedItem';

// Dummy data for charts
const barData = [
  { name: 'Jan', value: 300, risk: 'low' },
  { name: 'Feb', value: 400, risk: 'low' },
  { name: 'Mar', value: 600, risk: 'moderate' },
  { name: 'Apr', value: 900, risk: 'high' },
  { name: 'May', value: 1200, risk: 'very-high' }, // Peak monsoon
  { name: 'Jun', value: 1100, risk: 'high' },
  { name: 'Jul', value: 800, risk: 'moderate' },
  { name: 'Aug', value: 700, risk: 'moderate' },
  { name: 'Sep', value: 600, risk: 'moderate' },
  { name: 'Oct', value: 400, risk: 'low' },
  { name: 'Nov', value: 300, risk: 'low' },
  { name: 'Dec', value: 200, risk: 'low' },
];

const pieData = [
  { name: 'Low', value: 60, color: '#22c55e' },
  { name: 'Moderate', value: 25, color: '#eab308' },
  { name: 'High', value: 10, color: '#f97316' },
  { name: 'Very High', value: 5, color: '#ef4444' },
];

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('terrain');

  const getBarColor = (risk: string) => {
    switch (risk) {
      case 'very-high': return '#ef4444';
      case 'high': return '#f97316';
      case 'moderate': return '#eab308';
      default: return 'rgba(255,255,255,0.2)';
    }
  };

  return (
    <div className="flex w-full h-full text-slate-800 font-sans bg-slate-900">
      
      {/* LEFT PANEL - Glass Card (420px) */}
      <div className="w-[450px] h-full flex flex-col z-10 glass-panel bg-slate-950/80 border-r border-white/10 overflow-y-auto">
        
        {/* Header */}
        <div className="p-6 pb-2">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <span className="text-accent font-black text-xl">▲</span>
              <span className="font-bold text-lg tracking-wide">DHRUVA</span>
            </div>
            <div className="flex gap-3 text-slate-400">
              <button className="hover:text-white transition-colors"><Search size={18} /></button>
              <button className="hover:text-white transition-colors"><Bell size={18} /></button>
              <button className="hover:text-white transition-colors"><Maximize2 size={18} /></button>
            </div>
          </div>
          
          <h2 className="text-2xl font-light text-white mb-1">District Overview</h2>
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            Real-time landslide risk, hazard tracking, and environmental insights for Dima Hasao.
          </p>
          
          {/* Tabs */}
          <div className="flex gap-2 mb-4 bg-slate-900/50 p-1 rounded-lg border border-slate-800">
            {[
              { id: 'terrain', label: 'Terrain & Slope' },
              { id: 'hydro', label: 'Rainfall & Hydro' },
              { id: 'sar', label: 'Sentinel-1 SAR' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-1.5 text-[10px] uppercase font-bold tracking-wider rounded-md transition-all ${
                  activeTab === tab.id 
                    ? 'bg-white/10 text-white shadow-[0_2px_10px_rgba(0,0,0,0.2)] border border-white/5' 
                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Metrics based on tab */}
          <div className="grid grid-cols-3 gap-4 mb-8 glass-card p-3 rounded-xl">
            {activeTab === 'terrain' && (
              <>
                <MetricCard label="Avg Slope" value="32°" subValue="Max: 45°" />
                <MetricCard label="Elevation" value="850m" subValue="Dima Hasao avg" />
                <MetricCard label="Soil Type" value="Clay" subValue="High retention" />
              </>
            )}
            {activeTab === 'hydro' && (
              <>
                <MetricCard label="Rain 24h" value="124mm" subValue="Extreme" />
                <MetricCard label="Soil Moist" value="85%" subValue="Saturated" />
                <MetricCard label="Drainage" value="Poor" subValue="Blocked natural" />
              </>
            )}
            {activeTab === 'sar' && (
              <>
                <MetricCard label="Coherence" value="0.32" subValue="Decreased" />
                <MetricCard label="Displace" value="15mm" subValue="Subsidence" />
                <MetricCard label="Anomalies" value="4" subValue="New detected" />
              </>
            )}
          </div>
        </div>

        {/* Risk Trend Chart */}
        <div className="px-6 mb-6 glass-card mx-6 py-4 rounded-xl">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Annual Risk Trend</h3>
            <div className="flex items-center gap-3 text-[10px] font-medium text-slate-500">
              <span className="flex items-center gap-1"><span className="w-2 h-1 bg-risk-very-high"></span> Peak Risk</span>
              <span className="flex items-center gap-1"><span className="w-2 h-1 bg-white/20"></span> Baseline</span>
            </div>
          </div>
          <div className="h-32 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="value" radius={[2, 2, 2, 2]}>
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getBarColor(entry.risk)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Zones Donut & Alerts Split */}
        <div className="flex-1 px-6 pb-6 grid grid-cols-2 gap-6">
          
          <div className="flex flex-col glass-card p-4 rounded-xl">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-4">Risk Zones</h3>
            <div className="relative flex-1 min-h-[120px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    innerRadius={35}
                    outerRadius={55}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-bold text-white leading-none">15</span>
                <span className="text-[9px] text-slate-400 mt-1 uppercase">Active</span>
              </div>
            </div>
            {/* Legend */}
            <div className="mt-2 grid grid-cols-2 gap-x-2 gap-y-1 text-[9px] text-slate-600">
              <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-risk-very-high"></span>Very High</div>
              <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-risk-high"></span>High</div>
              <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-risk-moderate"></span>Mod</div>
              <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-risk-low"></span>Low</div>
            </div>
          </div>

          <div className="flex flex-col glass-card p-4 rounded-xl">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">Activity Feed</h3>
            <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-1 -mx-2 px-2">
              <AlertFeedItem 
                title="Extreme Rainfall" 
                description="124mm in 24h over Haflong." 
                time="12:22 PM" 
                severity="very-high" 
              />
              <AlertFeedItem 
                title="Soil Saturation" 
                description="Moisture index crossed 85%." 
                time="11:45 AM" 
                severity="high" 
              />
              <AlertFeedItem 
                title="Slope Subsidence" 
                description="Minor movement detected by SAR." 
                time="09:10 AM" 
                severity="moderate" 
              />
            </div>
          </div>

        </div>

      </div>

      {/* RIGHT PANEL - Map Hero */}
      <div className="flex-1 relative bg-slate-900">
        
        {/* Map Container */}
        <div className="absolute inset-0 z-0">
          <MapContainer 
            center={[25.1667, 93.0167]} // Dima Hasao coords
            zoom={11} 
            className="w-full h-full"
            zoomControl={false}
            attributionControl={false}
          >
            {/* MapTiler Base V4 layer */}
            <TileLayer
              attribution='&copy; MapTiler'
              url="https://api.maptiler.com/maps/base-v4/256/{z}/{x}/{y}.png?key=bU01ikkfggRXazoSnWSr"
            />
          </MapContainer>
        </div>
        
        {/* Vignette Overlay for cinematic look */}
        <div className="absolute inset-0 pointer-events-none z-10" 
          style={{ background: 'radial-gradient(circle at center, transparent 30%, rgba(5,10,20,0.8) 100%)' }}
        ></div>

        {/* Top Header Overlay */}
        <div className="absolute top-10 left-0 right-0 flex flex-col items-center text-center z-20 pointer-events-none drop-shadow-2xl">
          <h1 className="text-3xl font-light text-white mb-2">Dima Hasao District</h1>
          <p className="text-sm font-medium text-slate-300 uppercase tracking-widest">Assam, India</p>
        </div>

        {/* Floating Stat Pills */}
        <div className="absolute inset-0 z-20 pointer-events-none">
          <StatPill label="Rainfall Rate" value="124" unit="mm/24h" top="30%" left="15%" align="left" />
          <StatPill label="Avg Slope" value="32" unit="deg" top="45%" right="15%" align="right" />
          <StatPill label="SAR Coherence" value="0.32" unit="(low)" top="60%" left="20%" align="left" />
        </div>

        {/* Center/Bottom Gauge */}
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 pointer-events-none drop-shadow-2xl flex flex-col items-center">
          <RiskGauge score={68.4} category="HIGH RISK" />
        </div>

        {/* Bottom CTA */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30">
          <button className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold text-[11px] uppercase tracking-widest px-8 py-3 rounded-full shadow-[0_10px_30px_rgba(249,115,22,0.4)] transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2">
            <span className="text-white">⚡</span> View Latest Analysis
          </button>
        </div>
      </div>
    </div>
  );
}
