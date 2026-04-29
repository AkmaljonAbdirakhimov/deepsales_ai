const stats = [
  { label: "My calls", value: "42", change: "+4 this week" },
  { label: "Avg script score", value: "71%", change: "+2%" },
  { label: "Avg talk ratio", value: "61%", change: "-1%" },
];

export default function ManagerOverviewPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">My calls</h1>
        <p className="text-slate-400 text-sm mt-1">
          Your personal call performance.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2"
          >
            <p className="text-slate-400 text-sm">{s.label}</p>
            <p className="text-3xl font-bold text-white">{s.value}</p>
            <p className="text-xs text-emerald-400">{s.change}</p>
          </div>
        ))}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h2 className="text-white font-semibold mb-4">Recent calls</h2>
        <p className="text-slate-500 text-sm">
          Wire this up to <code className="text-slate-300">GET /calls?mine=1</code>{" "}
          (manager-scoped).
        </p>
      </div>
    </div>
  );
}
