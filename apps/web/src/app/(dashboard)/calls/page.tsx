export default function CallsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Calls</h1>
        <p className="text-slate-400 text-sm mt-1">All processed calls</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <p className="text-slate-500 text-sm">
          Call records will appear here once the API is connected.
        </p>
      </div>
    </div>
  );
}
