interface FactorBadgeProps {
  label: string;
  value: string | number;
  level: 'HIGH' | 'MOD' | 'LOW';
}

export default function FactorBadge({ label, value, level }: FactorBadgeProps) {
  const bg = level === 'HIGH' ? 'bg-red-100 text-red-800' : level === 'MOD' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800';
  
  return (
    <div className={`text-xs font-semibold px-2 py-1 rounded-full ${bg}`}>
      {level}
    </div>
  );
}
