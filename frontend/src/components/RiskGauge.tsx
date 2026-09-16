import React from 'react';

interface RiskGaugeProps {
  score: number; // 0 to 100
  category: string;
}

export default function RiskGauge({ score, category }: RiskGaugeProps) {
  const radius = 120;
  const strokeWidth = 12;
  const center = 150;
  
  // Create arc for semicircle (180 degrees)
  // Length of semi-circle arc is Math.PI * radius = 377
  const circumference = Math.PI * radius;
  
  // Calculate percentage
  const percent = Math.max(0, Math.min(100, score)) / 100;
  const offset = circumference - percent * circumference;
  
  // Determine color based on category
  let colorClass = 'text-risk-low';
  if (category === 'MODERATE') colorClass = 'text-risk-moderate';
  else if (category === 'HIGH RISK') colorClass = 'text-risk-high';
  else if (category === 'VERY HIGH') colorClass = 'text-risk-very-high';

  // Calculate needle angle
  // 0% = -180deg (left), 100% = 0deg (right) relative to center, or in SVG rotation:
  // -90 to +90 degrees around center
  const needleAngle = -90 + (percent * 180);

  return (
    <div className="relative flex flex-col items-center justify-center">
      <svg className="w-[300px] h-[160px]" viewBox="0 0 300 160">
        {/* Background Arc */}
        <path
          d={`M ${center - radius} ${center} A ${radius} ${radius} 0 0 1 ${center + radius} ${center}`}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        
        {/* Colored Value Arc */}
        <path
          d={`M ${center - radius} ${center} A ${radius} ${radius} 0 0 1 ${center + radius} ${center}`}
          fill="none"
          className={colorClass}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
        />

        {/* Needle */}
        <g transform={`rotate(${needleAngle} ${center} ${center})`} style={{ transition: 'transform 1s ease-in-out' }}>
          <circle cx={center} cy={center} r="6" fill="currentColor" className="text-white" />
          <path d={`M ${center - 4} ${center} L ${center} ${center - radius + 10} L ${center + 4} ${center} Z`} fill="currentColor" className="text-white" />
        </g>
        
        {/* Tick marks could go here */}
      </svg>
      
      <div className="absolute bottom-0 flex flex-col items-center text-center">
        <span className="text-xs font-bold tracking-[0.2em] text-slate-400 mb-1">VOLCANIC ACTIVITY INDEX</span>
        {/* We reuse the Vulcani aesthetic but change text in the parent or here */}
        <span className="text-5xl font-black text-white">{score.toFixed(3)}</span>
        <span className={`text-xs font-bold mt-2 px-3 py-1 rounded-full bg-white/10 ${colorClass}`}>
          ({category})
        </span>
      </div>
    </div>
  );
}
