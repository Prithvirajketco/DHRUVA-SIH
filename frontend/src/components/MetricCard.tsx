import React from 'react';

interface MetricCardProps {
  label: string;
  value: string;
  subValue?: string;
}

export default function MetricCard({ label, value, subValue }: MetricCardProps) {
  return (
    <div className="flex flex-col p-3 border border-slate-100 rounded-xl bg-slate-50/50">
      <div className="flex justify-between items-end mb-1">
        <span className="text-xl font-bold text-[#1E293B] leading-none">{value}</span>
      </div>
      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
        {label}
      </span>
      {subValue && (
        <span className="text-xs font-semibold text-slate-500 mt-1">{subValue}</span>
      )}
    </div>
  );
}
