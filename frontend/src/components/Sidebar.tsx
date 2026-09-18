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
    <div className="w-full md:w-[88px] h-16 md:h-full bg-[#1E293B] border-t md:border-t-0 md:border-r border-slate-800 text-slate-300 flex flex-row md:flex-col shrink-0 items-center justify-around md:justify-start py-0 md:py-8 z-50">
      <div className="hidden md:flex mb-10 flex-col items-center">
        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg">
          <span className="text-[#1E293B] font-black text-2xl">▲</span>
        </div>
      </div>

      <nav className="flex-1 w-full md:px-3 flex flex-row md:flex-col justify-around md:justify-start md:gap-6 items-center">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300
              ${activeTab === item.id 
                ? 'bg-[#F4F5F7] text-[#1E293B] shadow-[0_0_20px_rgba(255,255,255,0.1)]' 
                : 'text-slate-400 hover:text-white hover:bg-white/10'}`}
          >
            {activeTab === item.id && (
              <div className="absolute -bottom-1 md:-left-3 md:top-1/2 md:bottom-auto md:-translate-y-1/2 w-8 h-1 md:w-1 md:h-8 bg-white rounded-t-md md:rounded-t-none md:rounded-r-md"></div>
            )}
            <item.icon size={20} strokeWidth={activeTab === item.id ? 2.5 : 2} />
          </button>
        ))}
      </nav>

      <div className="hidden md:flex mt-4 flex-col items-center gap-2">
        <div 
          className={`w-3 h-3 rounded-full ${isOffline ? 'bg-risk-very-high' : 'bg-risk-low'} shadow-md`}
          title={isOffline ? 'Offline' : 'Online'}
        ></div>
      </div>
    </div>
  );
}
