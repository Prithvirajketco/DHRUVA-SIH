import React from 'react';

interface StatPillProps {
  label: string;
  value: string;
  unit: string;
  align?: 'left' | 'right';
  top: string;
  left?: string;
  right?: string;
}

export default function StatPill({ label, value, unit, align = 'left', top, left, right }: StatPillProps) {
  const isLeft = align === 'left';
  
  return (
    <div 
      className="absolute glass-card rounded-full px-4 py-2 flex items-center gap-3 backdrop-blur-md shadow-lg"
      style={{ top, left, right }}
    >
      {isLeft && (
        <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"></div>
      )}
      <div className="flex flex-col">
        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{label}</span>
        <div className="flex items-baseline gap-1">
          <span className="text-sm font-bold text-white">{value}</span>
          <span className="text-[10px] text-slate-300">{unit}</span>
        </div>
      </div>
      {!isLeft && (
        <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"></div>
      )}
      
      {/* Decorative connection line */}
      <div 
        className={`absolute top-1/2 -translate-y-1/2 w-16 h-[1px] bg-white/30 ${isLeft ? 'right-full' : 'left-full'}`}
      ></div>
      <div 
        className={`absolute top-1/2 -translate-y-1/2 w-[3px] h-[3px] rounded-full bg-white ${isLeft ? 'right-[calc(100%+64px)]' : 'left-[calc(100%+64px)]'}`}
      ></div>
    </div>
  );
}
