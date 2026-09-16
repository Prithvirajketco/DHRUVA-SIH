import React, { useState, useEffect } from 'react';
import { FileText, Plus, MapPin, Camera, AlertCircle } from 'lucide-react';

interface Report {
  id: string;
  location: string;
  type: string;
  description: string;
  status: 'SYNCED' | 'WAITING FOR SYNC';
  timestamp: string;
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    // Load cached reports from localStorage
    const cached = localStorage.getItem('dhruva_reports');
    if (cached) {
      setReports(JSON.parse(cached));
    } else {
      // Mock initial reports
      const initial = [
        { id: '1', location: 'Haflong - NH54', type: 'Road Blockage', description: 'Small mudslide blocking one lane.', status: 'SYNCED' as const, timestamp: new Date(Date.now() - 3600000).toLocaleString() },
        { id: '2', location: 'Mahur Village', type: 'Ground Crack', description: 'Large 5m crack observed near the community hall.', status: 'SYNCED' as const, timestamp: new Date(Date.now() - 86400000).toLocaleString() }
      ];
      setReports(initial);
      localStorage.setItem('dhruva_reports', JSON.stringify(initial));
    }

    const handleOnline = () => {
      setIsOffline(false);
      // Simulate sync
      setReports(prev => {
        const synced = prev.map(r => ({ ...r, status: 'SYNCED' as const }));
        localStorage.setItem('dhruva_reports', JSON.stringify(synced));
        return synced;
      });
    };
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleReportSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newReport: Report = {
      id: Date.now().toString(),
      location: formData.get('location') as string,
      type: formData.get('type') as string,
      description: formData.get('description') as string,
      status: isOffline ? 'WAITING FOR SYNC' : 'SYNCED',
      timestamp: new Date().toLocaleString()
    };

    const updated = [newReport, ...reports];
    setReports(updated);
    localStorage.setItem('dhruva_reports', JSON.stringify(updated));
    setShowModal(false);
  };

  const pendingSyncCount = reports.filter(r => r.status === 'WAITING FOR SYNC').length;

  return (
    <div className="p-8 h-full overflow-y-auto bg-slate-950 text-slate-200 relative">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <FileText className="text-accent" size={32} />
          Citizen Reports
        </h1>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-accent/20 hover:bg-accent/40 text-accent px-4 py-2 rounded-lg font-bold transition-colors border border-accent/50 shadow-[0_0_15px_rgba(249,115,22,0.2)]"
        >
          <Plus size={18} /> REPORT INCIDENT
        </button>
      </div>

      {isOffline && pendingSyncCount > 0 && (
        <div className="mb-6 bg-risk-moderate/10 border border-risk-moderate/30 p-4 rounded-lg flex items-center gap-3 text-risk-moderate font-medium">
          <AlertCircle />
          OFFLINE MODE: {pendingSyncCount} REPORTS WAITING FOR SYNC
        </div>
      )}

      <div className="glass-card rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900/50 text-slate-400 border-b border-white/5 text-sm uppercase tracking-wider">
              <th className="p-4 font-semibold">Location</th>
              <th className="p-4 font-semibold">Type</th>
              <th className="p-4 font-semibold">Description</th>
              <th className="p-4 font-semibold">Time</th>
              <th className="p-4 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {reports.map(report => (
              <tr key={report.id} className="hover:bg-slate-900/50 transition-colors">
                <td className="p-4 font-medium text-slate-200 flex items-center gap-2">
                  <MapPin size={16} className="text-slate-400"/> {report.location}
                </td>
                <td className="p-4">
                  <span className="bg-slate-800 text-slate-300 px-2 py-1 rounded text-xs font-semibold border border-slate-700">
                    {report.type}
                  </span>
                </td>
                <td className="p-4 text-slate-400 text-sm max-w-xs truncate">{report.description}</td>
                <td className="p-4 text-slate-500 text-sm">{report.timestamp}</td>
                <td className="p-4">
                  <span className={`text-xs font-bold px-2 py-1 rounded border ${
                    report.status === 'SYNCED' ? 'bg-risk-low/10 text-risk-low border-risk-low/20' : 'bg-risk-moderate/10 text-risk-moderate border-risk-moderate/20'
                  }`}>
                    {report.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-panel border border-white/10 rounded-xl p-6 w-full max-w-lg shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6">Report Incident</h2>
            <form onSubmit={handleReportSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1">Location</label>
                <input required name="location" type="text" placeholder="e.g. Haflong NH54" className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-accent" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1">Incident Type</label>
                <select name="type" className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-accent">
                  <option>Landslide</option>
                  <option>Road Blockage</option>
                  <option>Ground Crack</option>
                  <option>Flooding</option>
                  <option>Falling Rocks</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1">Description</label>
                <textarea required name="description" rows={3} placeholder="Describe the severity..." className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-accent"></textarea>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1">Photo (Optional)</label>
                <div className="w-full bg-slate-900/50 border border-dashed border-slate-600 rounded-lg p-6 flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:bg-slate-800 transition-colors">
                  <Camera size={32} className="mb-2 text-slate-500" />
                  <span className="text-sm">Click to upload photo</span>
                </div>
              </div>
              
              <div className="flex gap-3 mt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg transition-colors border border-slate-600">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-3 bg-accent/20 hover:bg-accent/40 text-accent font-bold rounded-lg transition-colors shadow-[0_0_15px_rgba(249,115,22,0.2)] border border-accent/50">
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
