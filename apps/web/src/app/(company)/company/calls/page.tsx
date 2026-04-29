export default function CompanyCallsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">All calls</h1>
        <p className="text-slate-400 text-sm mt-1">
          All calls processed across your team.
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <p className="text-slate-500 text-sm">
          Wire this up to <code className="text-slate-300">GET /calls</code> on
          the API.
        </p>
      </div>
    </div>
  );
}
