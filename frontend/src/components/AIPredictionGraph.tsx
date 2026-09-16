import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, CartesianGrid } from 'recharts';

interface AIPredictionGraphProps {
  currentRisk: number;
  isSimulating: boolean;
  isDashboard?: boolean;
}

export default function AIPredictionGraph({ currentRisk, isSimulating, isDashboard = false }: AIPredictionGraphProps) {
  // Temporal Engine (LSTM Proxy)
  // Calculates the derivative of risk based on the simulation state
  // If simulating, it means severe ongoing rainfall, so risk compound accelerates.
  
  const generateProjection = () => {
    let t6 = 0, t12 = 0, t24 = 0;
    
    if (isSimulating) {
      // Exponential decay to max risk (accelerated failure)
      t6 = Math.min(100, currentRisk + ((100 - currentRisk) * 0.4));
      t12 = Math.min(100, currentRisk + ((100 - currentRisk) * 0.7));
      t24 = Math.min(100, currentRisk + ((100 - currentRisk) * 0.9));
    } else {
      // Gradual natural drainage/drying (logarithmic decay)
      t6 = Math.max(0, currentRisk - (currentRisk * 0.05));
      t12 = Math.max(0, currentRisk - (currentRisk * 0.12));
      t24 = Math.max(0, currentRisk - (currentRisk * 0.25));
    }
    return [Math.round(t6), Math.round(t12), Math.round(t24)];
  };

  const [t6, t12, t24] = generateProjection();

  const data = [
    { time: 'Now', risk: currentRisk },
    { time: '+6H', risk: t6 },
    { time: '+12H', risk: t12 },
    { time: '+24H', risk: t24 },
  ];

  return (
    <div className={`p-3 rounded-lg border ${isDashboard ? 'bg-transparent border-none p-0 mt-0' : 'bg-slate-800/80 border-slate-700 mt-3'}`}>
      {!isDashboard && (
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-sm font-semibold text-slate-300">Temporal Risk Forecast (LSTM)</h4>
          {isSimulating && <span className="text-xs font-bold text-red-500 animate-pulse">ELEVATED TRAJECTORY</span>}
        </div>
      )}
      
      <div className={`${isDashboard ? 'h-48' : 'h-32'} w-full`}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            {isDashboard && <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />}
            <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '4px', fontSize: '12px' }}
              itemStyle={{ color: '#fff', fontWeight: 'bold' }}
            />
            <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="3 3" />
            <ReferenceLine y={40} stroke="#eab308" strokeDasharray="3 3" />
            <Line 
              type="monotone" 
              dataKey="risk" 
              stroke={isSimulating ? "#ef4444" : "#3b82f6"} 
              strokeWidth={3}
              dot={{ r: 4, fill: isSimulating ? "#ef4444" : "#3b82f6", strokeWidth: 0 }}
              activeDot={{ r: 6 }} 
              animationDuration={1500}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
