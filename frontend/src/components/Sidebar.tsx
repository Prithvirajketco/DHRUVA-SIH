import React, { useState, useEffect } from 'react';
import { Home, Map, Activity, Bell, FileText, Settings, Wifi } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'map', label: 'Risk Map', icon: Map },
    { id: 'prediction', label: 'Prediction', icon: Activity },
    { id: 'iot', label: 'IoT', icon: Wifi },
    { id: 'alerts', label: 'Alerts', icon: Bell },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="w-24 bg-panel border-r border-white/5 text-slate-300 flex flex-col h-full shrink-0 items-center py-6 backdrop-blur-xl z-50">
      <div className="mb-8 flex flex-col items-center">
        <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center mb-1 shadow-[0_0_15px_rgba(249,115,22,0.4)]">
          <span className="text-white font-black text-xl">▲</span>
        </div>
      </div>

      <nav className="flex-1 w-full px-2 flex flex-col gap-4 items-center">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center gap-1 w-full py-3 rounded-xl transition-all
              ${activeTab === item.id 
                ? 'bg-accent/10 text-accent shadow-[0_0_15px_rgba(249,115,22,0.15)] relative' 
                : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
          >
            {activeTab === item.id && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-accent rounded-r-md"></div>
            )}
            <item.icon size={22} className={activeTab === item.id ? 'text-accent' : ''} />
            <span className="text-[10px] font-semibold uppercase tracking-wider">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-4 flex flex-col items-center gap-2">
        <div 
          className={`w-3 h-3 rounded-full ${isOffline ? 'bg-risk-very-high' : 'bg-risk-low'} shadow-[0_0_8px_currentColor]`}
          title={isOffline ? 'Offline' : 'Online'}
        ></div>
      </div>
    </div>
  );
}
