import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { DashboardSummary } from '../types';
import { getRiskColor } from '../utils/riskColors';

interface RiskDistributionChartProps {
  summary: DashboardSummary;
}

export default function RiskDistributionChart({ summary }: RiskDistributionChartProps) {
  const data = [
    { name: 'Low Risk', value: summary.low_risk, color: getRiskColor(1) },
    { name: 'Moderate Risk', value: summary.moderate_risk, color: getRiskColor(2) },
    { name: 'High Risk', value: summary.high_risk, color: getRiskColor(3) },
    { name: 'Very High Risk', value: summary.very_high_risk, color: getRiskColor(4) },
  ].filter(d => d.value > 0);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
      <h3 className="font-bold text-slate-800 mb-4">Risk Distribution</h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
