import React, { useState } from 'react';
import { User, Bell, Globe, Database, Save, Shield, Moon, Smartphone } from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('account');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const handleSave = () => {
    setSaveStatus('Saving...');
    setTimeout(() => {
      setSaveStatus('Settings saved successfully!');
      setTimeout(() => setSaveStatus(null), 3000);
    }, 800);
  };

  return (
    <div className="flex h-full w-full bg-[#F4F5F7] p-8 overflow-y-auto">
      <div className="max-w-5xl w-full mx-auto flex flex-col">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-[#1E293B] tracking-tight">Settings</h1>
          <p className="text-slate-500 mt-2">Manage your account preferences and system configuration.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Settings Sidebar */}
          <div className="w-full md:w-64 shrink-0 space-y-1">
            {[
              { id: 'account', icon: User, label: 'Account Profile' },
              { id: 'notifications', icon: Bell, label: 'Notifications' },
              { id: 'preferences', icon: Globe, label: 'Preferences' },
              { id: 'system', icon: Database, label: 'System & API' },
              { id: 'security', icon: Shield, label: 'Security' },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                    isActive 
                      ? 'bg-[#1E293B] text-white shadow-md' 
                      : 'text-slate-500 hover:bg-slate-200 hover:text-[#1E293B]'
                  }`}
                >
                  <Icon size={18} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Settings Content */}
          <div className="flex-1">
            <div className="bg-white rounded-2xl shadow-soft border border-slate-100 p-8 min-h-[500px]">
              
              {activeTab === 'account' && (
                <div className="space-y-6 animate-fadeIn">
                  <h2 className="text-xl font-bold text-[#1E293B] mb-6 border-b border-slate-100 pb-4">Account Profile</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Full Name</label>
                      <input type="text" defaultValue="Admin User" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E11D48]/50 focus:border-[#E11D48] transition-all text-[#1E293B] font-semibold" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Email Address</label>
                      <input type="email" defaultValue="admin@dhruva.gov.in" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E11D48]/50 focus:border-[#E11D48] transition-all text-[#1E293B] font-semibold" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Role / Department</label>
                      <input type="text" defaultValue="Disaster Management Authority" disabled className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-semibold cursor-not-allowed" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Phone Number</label>
                      <input type="tel" defaultValue="+91 98765 43210" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E11D48]/50 focus:border-[#E11D48] transition-all text-[#1E293B] font-semibold" />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-6 animate-fadeIn">
                  <h2 className="text-xl font-bold text-[#1E293B] mb-6 border-b border-slate-100 pb-4">Alert Preferences</h2>
                  <div className="space-y-4">
                    {[
                      { title: 'Critical Landslide Warnings', desc: 'Immediate alerts for HIGH and VERY HIGH risk zones.', icon: Bell },
                      { title: 'SMS Broadcasts', desc: 'Send automated SMS to registered authorities during peak events.', icon: Smartphone },
                      { title: 'System Status Updates', desc: 'Notifications about data ingestion failures or model retraining.', icon: Database },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-start justify-between p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
                        <div className="flex items-start gap-4">
                          <div className="p-2 bg-slate-100 text-slate-600 rounded-lg"><item.icon size={20} /></div>
                          <div>
                            <h4 className="font-bold text-[#1E293B]">{item.title}</h4>
                            <p className="text-sm text-slate-500">{item.desc}</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer mt-1">
                          <input type="checkbox" defaultChecked={idx < 2} className="sr-only peer" />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#E11D48]"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'preferences' && (
                <div className="space-y-6 animate-fadeIn">
                  <h2 className="text-xl font-bold text-[#1E293B] mb-6 border-b border-slate-100 pb-4">Display & Regional</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Default Map Layer</label>
                      <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E11D48]/50 focus:border-[#E11D48] transition-all text-[#1E293B] font-semibold appearance-none">
                        <option>Terrain (Default)</option>
                        <option>Satellite</option>
                        <option>Street Map</option>
                        <option>Dark Mode Map</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Language</label>
                      <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E11D48]/50 focus:border-[#E11D48] transition-all text-[#1E293B] font-semibold appearance-none">
                        <option>English (UK)</option>
                        <option>Hindi</option>
                        <option>Assamese</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Timezone</label>
                      <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E11D48]/50 focus:border-[#E11D48] transition-all text-[#1E293B] font-semibold appearance-none">
                        <option>IST (UTC +5:30)</option>
                        <option>UTC</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Theme</label>
                      <div className="flex gap-2">
                        <button className="flex-1 py-3 bg-[#1E293B] text-white rounded-xl font-bold flex items-center justify-center gap-2 border-2 border-[#1E293B]"><Moon size={16} /> Dark</button>
                        <button className="flex-1 py-3 bg-white text-[#1E293B] rounded-xl font-bold flex items-center justify-center gap-2 border-2 border-slate-200 hover:border-[#1E293B] transition-colors">Light</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {(activeTab === 'system' || activeTab === 'security') && (
                <div className="space-y-6 animate-fadeIn flex flex-col items-center justify-center py-12 text-slate-500">
                  <Shield size={48} className="text-slate-300 mb-4" />
                  <h3 className="text-xl font-bold text-[#1E293B]">Advanced Settings</h3>
                  <p className="text-center max-w-md">Configuration for system APIs, data refresh rates, and security policies are restricted to Super Admins.</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-end gap-4">
                {saveStatus && (
                  <span className={`text-sm font-bold ${saveStatus.includes('success') ? 'text-green-600' : 'text-slate-500 animate-pulse'}`}>
                    {saveStatus}
                  </span>
                )}
                <button className="px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors">
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  className="px-6 py-2.5 rounded-xl font-bold bg-[#E11D48] text-white hover:bg-rose-700 shadow-[0_4px_14px_0_rgba(225,29,72,0.39)] hover:shadow-[0_6px_20px_rgba(225,29,72,0.23)] hover:-translate-y-0.5 transition-all flex items-center gap-2"
                >
                  <Save size={18} /> Save Changes
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
