interface MetricProps {
  label: string;
  value: string | number | null | undefined;
  className?: string;
}

export function Metric({ label, value, className }: MetricProps) {
  const displayValue =
    value === null || value === undefined || (typeof value === "string" && value.trim() === "")
      ? "No data"
      : String(value);

  return (
    <div className={className}>
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="mt-1 text-sm text-zinc-900">{displayValue}</p>
    </div>
  );
}
