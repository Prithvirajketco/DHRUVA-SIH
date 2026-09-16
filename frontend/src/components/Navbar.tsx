import { Link, useLocation } from 'react-router-dom';
import { Mountain } from 'lucide-react';

interface NavbarProps {
  modelVersion?: string;
  timestamp?: string;
}

export default function Navbar({ modelVersion = '1.0.0', timestamp = new Date().toISOString() }: NavbarProps) {
  const loc = useLocation();

  const links = [
    { path: '/', label: 'Map' },
    { path: '/authority', label: 'Authority' },
    { path: '/responder', label: 'Responder' }
  ];

  return (
    <nav className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-xl font-bold">
          <Mountain className="text-orange-500" />
          <span>LandslideWatch</span>
          <span className="text-slate-400 text-sm font-normal hidden sm:inline ml-2">Dima Hasao, Assam</span>
        </div>
        
        <div className="flex items-center gap-1">
          {links.map(l => (
            <Link 
              key={l.path} 
              to={l.path} 
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${loc.pathname === l.path ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
      
      <div className="hidden md:flex items-center gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <span>Model v{modelVersion}</span>
        </div>
        <span>|</span>
        <span>{new Date(timestamp).toLocaleString()}</span>
      </div>
    </nav>
  );
}
