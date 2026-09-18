import React, { useState } from 'react';
import { Search, Bell, Maximize2, Map } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { MapContainer, TileLayer, Polyline, Circle, CircleMarker } from 'react-leaflet';
import RiskGauge from '../components/RiskGauge';
import StatPill from '../components/StatPill';
import MetricCard from '../components/MetricCard';
import AlertFeedItem from '../components/AlertFeedItem';

interface DashboardPageProps {
  setActiveTab?: (tab: string) => void;
}

// Dummy data for charts
const ROUTE_1: [number, number][] = [
  [25.17, 93.02],
  [25.18, 93.01],
  [25.195, 92.99],
  [25.21, 92.98]
];

const ROUTE_2: [number, number][] = [
  [25.17, 93.02],
  [25.16, 93.00],
  [25.17, 92.98],
  [25.21, 92.98]
];

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

export default function DashboardPage({ setActiveTab }: DashboardPageProps) {
  const [activeTab, setActiveTabLocal] = useState('terrain');
  const [showEvacModal, setShowEvacModal] = useState(false);

  const getBarColor = (risk: string) => {
    switch (risk) {
      case 'very-high': return '#ef4444';
      case 'high': return '#f97316';
      case 'moderate': return '#eab308';
      default: return 'rgba(255,255,255,0.2)';
    }
  };

  return (
    <div className="flex flex-col md:flex-row w-full h-full font-sans overflow-y-auto md:overflow-hidden relative bg-slate-900">
      
      {/* GLOBAL Immersive Background */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center opacity-80"
        style={{ backgroundImage: 'url(/mountain_bg.png)' }}
      ></div>
      {/* Soft atmospheric overlay */}
      <div className="fixed inset-0 z-0 pointer-events-none" 
        style={{ background: 'linear-gradient(135deg, rgba(244,245,247,0.8) 0%, rgba(15,23,42,0.4) 100%)' }}
      ></div>

      {/* DYNAMIC THREAT BORDER (Simulating a HIGH risk scenario pulse) */}
      <div className="fixed inset-0 z-[100] pointer-events-none border-[6px] border-[#E11D48]/30 shadow-[inset_0_0_50px_rgba(225,29,72,0.2)] animate-pulse transition-opacity duration-1000 opacity-100"></div>

      {/* LEFT PANEL - Glass Frosted */}
      <div className="w-full md:w-[500px] shrink-0 h-auto md:h-full flex flex-col z-10 glass-frosted border-b md:border-b-0 md:border-r border-white/50 md:overflow-y-auto">
        
        {/* Header */}
        <div className="p-8 pb-4">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#E11D48] flex items-center justify-center shadow-md">
                <span className="text-white font-black text-sm">▲</span>
              </div>
              <span className="font-extrabold text-xl tracking-wide text-[#1E293B]">DHRUVA</span>
            </div>
            <div className="flex gap-4 text-slate-400">
              <button className="hover:text-[#1E293B] transition-colors"><Search size={20} /></button>
              <button className="hover:text-[#1E293B] transition-colors"><Bell size={20} /></button>
              <button className="hover:text-[#1E293B] transition-colors"><Maximize2 size={20} /></button>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-[#1E293B] mb-2 tracking-tight">District Overview</h2>
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">
            Real-time landslide risk, hazard tracking, and environmental insights for Dima Hasao.
          </p>
          
          {/* Tabs */}
          <div className="flex flex-col sm:flex-row gap-2 mb-6 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
            {[
              { id: 'terrain', label: 'Terrain & Slope' },
              { id: 'hydro', label: 'Rainfall & Hydro' },
              { id: 'sar', label: 'Sentinel-1 SAR' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTabLocal(tab.id)}
                className={`flex-1 py-2 px-1 text-[10px] sm:text-[11px] uppercase font-bold tracking-wider rounded-lg transition-all ${
                  activeTab === tab.id 
                    ? 'bg-white text-[#1E293B] shadow-sm border border-slate-200/50' 
                    : 'text-slate-500 hover:text-[#1E293B] hover:bg-white/50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Metrics based on tab */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 bg-white p-4 rounded-2xl shadow-soft border border-slate-100">
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
        <div className="px-8 mb-8">
          <div className="bg-white p-5 rounded-2xl shadow-soft border border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Annual Risk Trend</h3>
              <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-risk-very-high"></span> Peak Risk</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-200"></span> Baseline</span>
              </div>
            </div>
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip 
                    cursor={{ fill: '#f1f5f9' }}
                    contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '12px', fontWeight: 600, color: '#1e293b', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 4, 4]}>
                    {barData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getBarColor(entry.risk) === 'rgba(255,255,255,0.2)' ? '#e2e8f0' : getBarColor(entry.risk)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Risk Zones Donut & Alerts Split */}
        <div className="flex-1 px-8 pb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="flex flex-col bg-white p-5 rounded-2xl shadow-soft border border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Risk Zones</h3>
            <div className="relative flex-1 min-h-[140px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    innerRadius={45}
                    outerRadius={65}
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
                <span className="text-3xl font-black text-[#1E293B] leading-none">15</span>
                <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Active</span>
              </div>
            </div>
            {/* Legend */}
            <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2 text-[10px] font-bold text-slate-500">
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-risk-very-high"></span>Very High</div>
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-risk-high"></span>High</div>
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-risk-moderate"></span>Mod</div>
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-risk-low"></span>Low</div>
            </div>
          </div>

          <div className="flex flex-col bg-white p-5 rounded-2xl shadow-soft border border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Activity Feed</h3>
            <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-2 -mx-2 px-2">
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

      {/* RIGHT PANEL - Immersive Background */}
      <div className="flex-1 min-h-[500px] md:min-h-0 relative bg-transparent shrink-0">
        
        {/* Soft atmospheric overlay */}
        <div className="absolute inset-0 pointer-events-none z-10" 
          style={{ background: 'linear-gradient(180deg, rgba(15,23,42,0.0) 0%, rgba(15,23,42,0.4) 100%)' }}
        ></div>

        {/* Top Header Overlay */}
        <div className="absolute top-16 left-0 right-0 flex flex-col items-center text-center z-20 pointer-events-none drop-shadow-lg">
          <h1 className="text-4xl font-light text-white mb-3">Dima Hasao District</h1>
          <p className="text-sm font-semibold text-slate-200/80 uppercase tracking-[0.2em]">Assam, India</p>
        </div>

        {/* Floating Stat Pills overlaying the mountain */}
        <div className="absolute inset-0 z-20 pointer-events-none">
          <StatPill label="Rainfall Rate" value="124" unit="mm/24h" top="28%" left="12%" align="left" />
          <StatPill label="Avg Slope" value="32" unit="deg" top="38%" right="12%" align="right" />
          <StatPill label="SAR Coherence" value="0.32" unit="(low)" top="55%" left="15%" align="left" />
        </div>

        {/* Center/Bottom Gauge */}
        <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-20 pointer-events-none drop-shadow-2xl flex flex-col items-center">
          <RiskGauge score={68.4} category="HIGH RISK" />
        </div>

        {/* Bottom CTA */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex flex-col sm:flex-row gap-4 w-[90%] sm:w-max">
          <button 
            onClick={() => setActiveTab?.('prediction')}
            className="w-full sm:w-auto bg-[#1e293b]/90 backdrop-blur-md border border-slate-600 hover:bg-[#1e293b] text-white font-bold text-xs uppercase tracking-widest px-8 py-4 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.4)] transition-all transform hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-3"
          >
            <span className="w-2 h-2 rounded-full bg-[#E11D48] animate-pulse"></span> View Latest Analysis
          </button>
          <button 
            onClick={() => setShowEvacModal(true)}
            className="w-full sm:w-auto bg-[#E11D48]/90 backdrop-blur-md border border-[#E11D48] hover:bg-[#E11D48] text-white font-bold text-xs uppercase tracking-widest px-8 py-4 rounded-full shadow-[0_8px_30px_rgba(225,29,72,0.4)] transition-all transform hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-3"
          >
            <Map size={16} /> Evacuation Route
          </button>
        </div>
      </div>

      {/* Evacuation Route Modal */}
      {showEvacModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.1)] w-full max-w-5xl h-[85vh] overflow-hidden border border-slate-100 flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-[#E11D48]/10 text-[#E11D48] rounded-xl">
                  <Map size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-extrabold text-[#1E293B] tracking-tight">Active Evacuation Routes</h2>
                  <p className="text-xs text-slate-500 font-semibold mt-1">
                    AI-Calculated safe paths avoiding unstable terrain in Dima Hasao
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowEvacModal(false)}
                className="p-2 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors text-slate-500"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 flex flex-col md:flex-row bg-[#F4F5F7] overflow-hidden">
              {/* Map Area */}
              <div className="flex-1 relative bg-slate-200">
                <MapContainer center={[25.17, 93.02]} zoom={12} className="w-full h-full z-0" zoomControl={false}>
                  <TileLayer 
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}" 
                    attribution="Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ"
                  />
                  {/* Primary Route */}
                  <Polyline 
                    positions={ROUTE_1} 
                    pathOptions={{ color: '#3b82f6', weight: 5, className: 'animate-pulse' }} 
                  />
                  {/* Secondary Route */}
                  <Polyline 
                    positions={ROUTE_2} 
                    pathOptions={{ color: '#94a3b8', weight: 4, dashArray: '8, 8' }} 
                  />
                  {/* Hazard Zone */}
                  <Circle 
                    center={[25.17, 92.99]} 
                    radius={1200} 
                    pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.2 }} 
                  />
                  {/* Assembly Point */}
                  <CircleMarker 
                    center={[25.21, 92.98]} 
                    radius={8} 
                    pathOptions={{ color: '#22c55e', fillColor: '#22c55e', fillOpacity: 1 }} 
                  />
                </MapContainer>
                {/* Overlay UI on Map */}
                <div className="absolute top-4 left-4 z-[400] bg-white p-4 rounded-xl shadow-lg border border-slate-100 w-64">
                  <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-3">Map Legend</h4>
                  <div className="space-y-3 text-sm font-semibold text-[#1E293B]">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-1 bg-blue-500 rounded-full"></div> Primary Safe Route
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-1 bg-slate-300 rounded-full border border-slate-400 border-dashed"></div> Secondary Path
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-red-500/20 border-2 border-red-500 rounded-full"></div> Hazard Zone
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-sm"></div> Assembly Point
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Sidebar */}
              <div className="w-full md:w-80 bg-white border-l border-slate-200 p-6 flex flex-col gap-6 overflow-y-auto shrink-0">
                <div>
                  <h3 className="font-extrabold text-[#1E293B] text-lg mb-2">Recommended Actions</h3>
                  <div className="p-4 bg-red-50 border border-red-100 rounded-xl mb-4">
                    <p className="text-sm font-bold text-red-700 leading-snug">
                      Zone A residents must evacuate immediately via Route 1. Avoid NH-54 due to critical slope failure risk.
                    </p>
                  </div>
                  <button className="w-full bg-[#1E293B] hover:bg-slate-800 text-white font-bold py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2">
                    <Bell size={16} /> Broadcast to Residents
                  </button>
                </div>
                
                <div>
                  <h3 className="font-extrabold text-[#1E293B] text-lg mb-4">Route Status</h3>
                  
                  <div className="space-y-3">
                    <div className="p-3 border border-slate-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer group">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-sm text-[#1E293B]">Route 1 (Northern Ridge)</h4>
                        <span className="text-[10px] font-black text-green-600 bg-green-100 px-2 py-0.5 rounded-full">CLEAR</span>
                      </div>
                      <p className="text-xs font-semibold text-slate-500">Est. travel time: 45m · Follows ridgeline</p>
                    </div>

                    <div className="p-3 border border-slate-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer opacity-70">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-sm text-[#1E293B]">Route 2 (Valley Pass)</h4>
                        <span className="text-[10px] font-black text-red-600 bg-red-100 px-2 py-0.5 rounded-full">BLOCKED</span>
                      </div>
                      <p className="text-xs font-semibold text-slate-500">Debris flow detected at km 12.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
