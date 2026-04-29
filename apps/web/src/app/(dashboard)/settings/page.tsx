export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-slate-400 text-sm mt-1">Manage integrations and preferences</p>
      </div>

      <div className="space-y-4">
        {["CRM Integrations", "API Keys", "Team Members", "Notifications"].map((section) => (
          <div
            key={section}
            className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center justify-between"
          >
            <div>
              <p className="text-white font-medium">{section}</p>
              <p className="text-slate-500 text-sm mt-0.5">Configure {section.toLowerCase()}</p>
            </div>
            <button className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
              Manage →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
