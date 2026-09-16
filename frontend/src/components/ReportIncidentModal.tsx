import { useState } from 'react';
import { X } from 'lucide-react';

interface ReportIncidentModalProps {
  onClose: () => void;
  lat: number;
  lon: number;
  onSuccess: () => void;
}

export default function ReportIncidentModal({ onClose, lat, lon, onSuccess }: ReportIncidentModalProps) {
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/incidents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location, lat, lon, description })
      });
      if (response.ok) {
        onSuccess();
        onClose();
      } else {
        alert("Failed to report incident.");
      }
    } catch (e) {
      console.error(e);
      alert("Error reporting incident.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[2000]">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-800">Report Landslide Incident</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-md">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Coordinates</label>
            <input type="text" disabled value={`${lat.toFixed(5)}, ${lon.toFixed(5)}`} className="w-full bg-slate-100 border border-slate-200 rounded-md p-2 text-sm" />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Location Name / Landmark</label>
            <input required type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Near Haflong market" className="w-full border border-slate-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea required rows={4} value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe the severity, damage, and current situation..." className="w-full border border-slate-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"></textarea>
          </div>
          
          <div className="flex justify-end gap-2 mt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-md transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-md transition-colors disabled:opacity-50">
              {loading ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
