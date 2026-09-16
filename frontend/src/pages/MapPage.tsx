import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import { DIMA_HASAO_LOCATIONS, DemoLocation } from '../data/demoLocations';
import { calculateRisk, RiskResult } from '../utils/riskCalculator';
import RiskCard from '../components/RiskCard';

const DIMA_HASAO_CENTER: [number, number] = [25.176, 93.023]; // Haflong center

export default function MapPage() {
  const [locations, setLocations] = useState<DemoLocation[]>(DIMA_HASAO_LOCATIONS);
  const [selectedLocId, setSelectedLocId] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [showEvacuationRoute, setShowEvacuationRoute] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio('https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg');
  }, []);

  const selectedLoc = locations.find(l => l.id === selectedLocId);
  const selectedRisk = selectedLoc ? calculateRisk(selectedLoc) : null;

  const handleRunSimulation = () => {
    if (!selectedLoc) return;
    
    // 1. Trigger Simulation Mode
    setIsSimulating(true);
    setShowEvacuationRoute(false);

    // 2. Increase rainfall dramatically after 1.5 seconds (Simulating a storm)
    setTimeout(() => {
      setLocations(prev => prev.map(loc => {
        if (loc.id === selectedLoc.id) {
          const newRainfall = loc.rainfall + 140;
          const newMoisture = Math.min(100, loc.soil_moisture + 25);
          
          // Check if new risk will be HIGH
          const tempRisk = calculateRisk({ ...loc, rainfall: newRainfall, soil_moisture: newMoisture });
          if (tempRisk.level === 'HIGH' && audioRef.current) {
            audioRef.current.play().catch(e => console.log('Audio play blocked:', e));
          }

          return { ...loc, rainfall: newRainfall, soil_moisture: newMoisture };
        }
        return loc;
      }));
    }, 1500);
  };

  const handleShowRoute = () => {
    setShowEvacuationRoute(true);
  };

  const getMarkerIcon = (loc: DemoLocation, isSelected: boolean) => {
    const risk = calculateRisk(loc);
    let colorClass = 'bg-risk-low';
    let shadowClass = 'shadow-[0_0_10px_var(--risk-low)]';
    
    if (risk.level === 'HIGH') {
      colorClass = 'bg-risk-high';
      shadowClass = 'shadow-[0_0_15px_var(--risk-high)]';
    } else if (risk.level === 'MEDIUM') {
      colorClass = 'bg-risk-moderate';
      shadowClass = 'shadow-[0_0_10px_var(--risk-moderate)]';
    }

    const size = isSelected ? 'w-5 h-5' : 'w-4 h-4';
    const isHigh = risk.level === 'HIGH';

    const html = `
      <div class="relative flex items-center justify-center w-full h-full">
        ${isHigh ? `<div class="absolute inset-0 rounded-full ${colorClass} opacity-75 animate-ping" style="animation-duration: 1s;"></div>` : ''}
        <div class="relative ${size} rounded-full ${colorClass} ${shadowClass} border-2 border-slate-900 transition-all duration-300"></div>
      </div>
    `;

    return L.divIcon({
      html,
      className: 'custom-radar-marker',
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
  };

  // Fake evacuation route leaving Haflong to a safe lower elevation
  const EVACUATION_ROUTE: [number, number][] = [
    [25.176, 93.023], // Haflong
    [25.185, 93.010],
    [25.190, 92.990],
    [25.210, 92.950]  // Safe Zone
  ];

  return (
    <div className="relative w-full h-full bg-slate-900">
      {/* Top Banner indicating Demo Mode */}
      <div className="absolute top-0 left-0 right-0 bg-blue-600/20 text-blue-300 border-b border-blue-500/30 text-xs py-2 text-center z-[1000] font-bold tracking-widest uppercase">
        DEMO DATA - Live satellite integration available in production version
      </div>

      <MapContainer center={DIMA_HASAO_CENTER} zoom={10} className="w-full h-full z-0 mt-8">
        <TileLayer
          attribution='&copy; <a href="https://www.maptiler.com/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://api.maptiler.com/maps/base-v4/256/{z}/{x}/{y}.png?key=bU01ikkfggRXazoSnWSr"
        />

        {locations.map((loc) => {
          const isSelected = loc.id === selectedLocId;
          const icon = getMarkerIcon(loc, isSelected);
          
          return (
            <Marker
              key={loc.id}
              position={[loc.lat, loc.lon]}
              icon={icon}
              eventHandlers={{
                click: () => {
                  setSelectedLocId(loc.id);
                  setIsSimulating(false);
                  setShowEvacuationRoute(false);
                  if (audioRef.current) {
                    audioRef.current.pause();
                    audioRef.current.currentTime = 0;
                  }
                }
              }}
            >
              <Tooltip direction="top" offset={[0, -10]} opacity={1} className="custom-tooltip">
                <span className="font-bold text-slate-800">{loc.name}</span>
              </Tooltip>
            </Marker>
          );
        })}

        {showEvacuationRoute && (
          <Polyline 
            positions={EVACUATION_ROUTE} 
            pathOptions={{ color: '#3b82f6', weight: 4, dashArray: '10, 10' }} 
          />
        )}
      </MapContainer>

      {/* Map Overlay Legend */}
      <div className="absolute bottom-6 left-6 glass-panel p-3 rounded-lg z-[1000]">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Risk Legend</h4>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-risk-high shadow-[0_0_10px_var(--risk-high)]"></div><span className="text-sm text-slate-300">High Risk</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-risk-moderate shadow-[0_0_10px_var(--risk-moderate)]"></div><span className="text-sm text-slate-300">Medium Risk</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-risk-low shadow-[0_0_10px_var(--risk-low)]"></div><span className="text-sm text-slate-300">Safe</span></div>
        </div>
      </div>

      {/* Action / Details Panel */}
      {selectedLoc && selectedRisk && (
        <RiskCard 
          location={selectedLoc}
          risk={selectedRisk}
          isSimulating={isSimulating}
          onClose={() => setSelectedLocId(null)}
          onRunSimulation={handleRunSimulation}
          onShowRoute={handleShowRoute}
        />
      )}
    </div>
  );
}
