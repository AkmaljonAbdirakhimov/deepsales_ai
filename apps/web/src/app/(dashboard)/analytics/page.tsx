export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-slate-400 text-sm mt-1">Performance metrics across your team</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {["Script Adherence", "Talk Ratio", "Objection Handling", "Lead Quality"].map((metric) => (
          <div
            key={metric}
            className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-2"
          >
            <p className="text-white font-medium">{metric}</p>
            <div className="h-32 flex items-center justify-center text-slate-600 text-sm border border-dashed border-slate-700 rounded-lg">
              Chart coming soon
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
