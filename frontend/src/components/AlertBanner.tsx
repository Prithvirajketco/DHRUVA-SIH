import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AlertBannerProps {
  count: number;
}

export default function AlertBanner({ count }: AlertBannerProps) {
  const [visible, setVisible] = useState(true);

  if (!visible || count === 0) return null;

  return (
    <div className="bg-red-600 text-white px-4 py-2 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <AlertTriangle size={18} />
        <span className="font-semibold">
          ⚠ {count} HIGH ALERT areas in Dima Hasao — <Link to="/" className="underline hover:text-red-200">View Map</Link>
        </span>
      </div>
      <button onClick={() => setVisible(false)} className="text-white hover:text-red-200">
        <X size={18} />
      </button>
    </div>
  );
}
