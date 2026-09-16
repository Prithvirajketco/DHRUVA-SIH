import { RiskFeature } from '../types';
import { getRiskTextColor, getRiskBgColor } from '../utils/riskColors';

interface HotspotTableProps {
  hotspots: RiskFeature[];
  onSelect?: (f: RiskFeature) => void;
}

export default function HotspotTable({ hotspots, onSelect }: HotspotTableProps) {
  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-slate-200">
      <table className="w-full text-sm text-left">
        <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
          <tr>
            <th className="px-4 py-3">Rank</th>
            <th className="px-4 py-3">Location</th>
            <th className="px-4 py-3">Risk Level</th>
            <th className="px-4 py-3">Score</th>
            <th className="px-4 py-3">Slope</th>
            <th className="px-4 py-3">Rain 24h</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {hotspots.map((h, idx) => (
            <tr 
              key={h.cell_id} 
              onClick={() => onSelect?.(h)}
              className={`hover:bg-slate-50 transition-colors ${onSelect ? 'cursor-pointer' : ''}`}
            >
              <td className="px-4 py-3 text-slate-500 font-medium">#{idx + 1}</td>
              <td className="px-4 py-3 text-slate-700">{h.lat.toFixed(4)}, {h.lon.toFixed(4)}</td>
              <td className="px-4 py-3">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getRiskBgColor(h.risk_category)} ${getRiskTextColor(h.risk_category)}`}>
                  {h.risk_label}
                </span>
              </td>
              <td className="px-4 py-3 font-semibold text-slate-700">{(h.risk_score * 100).toFixed(1)}%</td>
              <td className="px-4 py-3 text-slate-600">{h.slope.toFixed(1)}°</td>
              <td className="px-4 py-3 text-slate-600">{h.rainfall_24h.toFixed(1)}mm</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
