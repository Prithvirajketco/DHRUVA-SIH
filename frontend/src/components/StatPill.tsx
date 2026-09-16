import React, { useMemo } from 'react';
import { useAnimatedNumber } from '../hooks/useAnimatedNumber';

interface StatPillProps {
  label: string;
  value: string | number;
  unit: string;
  align?: 'left' | 'right';
  top: string;
  left?: string;
  right?: string;
}

export default function StatPill({ label, value, unit, align = 'left', top, left, right }: StatPillProps) {
  const isLeft = align === 'left';
  
  // Try to parse string to number for animation
  const numericValue = useMemo(() => {
    if (typeof value === 'number') return value;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }, [value]);
  
  const animatedValue = useAnimatedNumber(numericValue, 1000);
  
  // Format based on original type/decimals
  const displayValue = useMemo(() => {
    if (typeof value === 'string' && value.includes('.')) {
      const decimals = value.split('.')[1].length;
      return animatedValue.toFixed(decimals);
    }
    return Math.round(animatedValue).toString();
  }, [animatedValue, value]);

  return (
    <div 
      className="absolute glass-frosted rounded-full px-4 py-2 flex items-center gap-3 shadow-lg"
      style={{ top, left, right }}
    >
      {isLeft && (
        <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"></div>
      )}
      <div className="flex flex-col">
        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">{label}</span>
        <div className="flex items-baseline gap-1">
          <span className="text-sm font-bold text-[#1E293B] font-mono">{displayValue}</span>
          <span className="text-[10px] text-slate-400">{unit}</span>
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
