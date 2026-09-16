import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface AlertFeedItemProps {
  title: string;
  description: string;
  time: string;
  severity: 'low' | 'moderate' | 'high' | 'very-high';
}

export default function AlertFeedItem({ title, description, time, severity }: AlertFeedItemProps) {
  let borderColor = 'border-risk-low';
  let iconColor = 'text-risk-low';
  
  if (severity === 'moderate') {
    borderColor = 'border-risk-moderate';
    iconColor = 'text-risk-moderate';
  } else if (severity === 'high') {
    borderColor = 'border-risk-high';
    iconColor = 'text-risk-high';
  } else if (severity === 'very-high') {
    borderColor = 'border-risk-very-high';
    iconColor = 'text-risk-very-high';
  }

  return (
    <div className={`flex gap-4 p-4 border-l-2 ${borderColor} bg-slate-50 rounded-r-xl mb-3 relative overflow-hidden group border border-slate-100 shadow-sm`}>
      <div className="absolute inset-0 bg-gradient-to-r from-slate-100/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <div className={`mt-0.5 ${iconColor}`}>
        <AlertTriangle size={18} />
      </div>
      <div className="flex-1">
        <h4 className="text-sm font-bold text-[#1E293B]">{title}</h4>
        <p className="text-xs font-semibold text-slate-500 mt-1 leading-relaxed">{description}</p>
      </div>
      <div className="text-[10px] font-bold text-slate-400 whitespace-nowrap">
        {time}
      </div>
    </div>
  );
}
