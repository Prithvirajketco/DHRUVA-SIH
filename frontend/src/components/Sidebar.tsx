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

  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Hamburger Button */}
      <div className="md:hidden fixed top-4 right-4 z-[10000]">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-3 bg-[#1E293B] text-white rounded-xl shadow-lg border border-slate-700 focus:outline-none"
        >
          <div className="flex flex-col gap-1.5 w-5">
            <span className={`h-0.5 w-full bg-white transition-all ${isOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
            <span className={`h-0.5 w-full bg-white transition-all ${isOpen ? 'opacity-0' : ''}`}></span>
            <span className={`h-0.5 w-full bg-white transition-all ${isOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
          </div>
        </button>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-[9998]"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <div className={`fixed top-0 left-0 h-full w-[88px] bg-[#1E293B] border-r border-slate-800 text-slate-300 flex flex-col shrink-0 items-center py-8 z-[9999] transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="mb-10 flex flex-col items-center">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-[#1E293B] font-black text-2xl">▲</span>
          </div>
        </div>

        <nav className="flex-1 w-full px-3 flex flex-col justify-start gap-6 items-center">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsOpen(false);
              }}
              className={`relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300
                ${activeTab === item.id 
                  ? 'bg-[#F4F5F7] text-[#1E293B] shadow-[0_0_20px_rgba(255,255,255,0.1)]' 
                  : 'text-slate-400 hover:text-white hover:bg-white/10'}`}
              title={item.label}
            >
              {activeTab === item.id && (
                <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-md"></div>
              )}
              <item.icon size={20} strokeWidth={activeTab === item.id ? 2.5 : 2} />
            </button>
          ))}
        </nav>

        <div className="mt-4 flex flex-col items-center gap-2">
          <div 
            className={`w-3 h-3 rounded-full ${isOffline ? 'bg-risk-very-high' : 'bg-risk-low'} shadow-md`}
            title={isOffline ? 'Offline' : 'Online'}
          ></div>
        </div>
      </div>
    </>
  );
}
