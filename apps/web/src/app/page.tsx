import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white px-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div className="space-y-3">
          <h1 className="text-5xl font-bold tracking-tight">
            Deep<span className="text-blue-400">Sales</span>
          </h1>
          <p className="text-slate-400 text-lg">
            AI-powered call analysis and CRM automation platform
          </p>
        </div>

        <div className="flex justify-center">
          <Link
            href="/login"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition-colors"
          >
            Sign in
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 text-sm text-left">
          {[
            { label: "Call Analysis", desc: "Transcription, sentiment, script adherence" },
            { label: "CRM Automation", desc: "Auto-sync notes, tasks, and deal updates" },
            { label: "Analytics", desc: "Team performance at a glance" },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1"
            >
              <p className="font-semibold text-white">{item.label}</p>
              <p className="text-slate-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
