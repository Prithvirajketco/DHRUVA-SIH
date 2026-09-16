import React from 'react';

interface MetricCardProps {
  label: string;
  value: string;
  subValue?: string;
}

export default function MetricCard({ label, value, subValue }: MetricCardProps) {
  return (
    <div className="flex flex-col py-2 border-b border-white/5 last:border-0">
      <div className="flex justify-between items-end mb-1">
        <span className="text-xl font-bold text-white leading-none">{value}</span>
      </div>
      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
        {label}
      </span>
      {subValue && (
        <span className="text-xs text-slate-400 mt-1">{subValue}</span>
      )}
    </div>
  );
}
