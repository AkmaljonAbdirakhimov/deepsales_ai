const stats = [
  { label: "Calls Analyzed", value: "1,284", change: "+12%" },
  { label: "Avg Script Score", value: "74%", change: "+3%" },
  { label: "Avg Talk Ratio", value: "58%", change: "-2%" },
  { label: "Open Tasks", value: "37", change: "+5" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Overview</h1>
        <p className="text-slate-400 text-sm mt-1">Last 30 days</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2"
          >
            <p className="text-slate-400 text-sm">{s.label}</p>
            <p className="text-3xl font-bold text-white">{s.value}</p>
            <p className="text-xs text-emerald-400">{s.change} vs prev period</p>
          </div>
        ))}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h2 className="text-white font-semibold mb-4">Recent Calls</h2>
        <p className="text-slate-500 text-sm">
          Call list will appear here once integrated with the API.
        </p>
      </div>
    </div>
  );
}
