export default function IntegrationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Integrations</h1>
        <p className="text-slate-400 text-sm mt-1">
          Connect your CRM and telephony providers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { name: "Salesforce", desc: "Sync leads, accounts and call activity." },
          { name: "HubSpot", desc: "Push call analyses to deal records." },
          { name: "Pipedrive", desc: "Update activities from call outcomes." },
          { name: "Generic webhook", desc: "Receive call events from any source." },
        ].map((i) => (
          <div
            key={i.name}
            className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center justify-between"
          >
            <div>
              <p className="text-white font-medium">{i.name}</p>
              <p className="text-slate-400 text-sm">{i.desc}</p>
            </div>
            <button
              disabled
              className="px-3 py-1.5 text-sm rounded-lg bg-slate-800 text-slate-500"
            >
              Soon
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
