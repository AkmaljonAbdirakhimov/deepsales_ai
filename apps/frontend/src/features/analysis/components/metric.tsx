interface MetricProps {
  label: string;
  value: string;
  className?: string;
}

export function Metric({ label, value, className }: MetricProps) {
  return (
    <div className={className}>
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="mt-1 text-sm text-zinc-900">{value}</p>
    </div>
  );
}
