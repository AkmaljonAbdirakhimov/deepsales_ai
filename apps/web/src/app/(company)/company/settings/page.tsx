import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export default async function CompanySettingsPage() {
  const reqHeaders = await headers();
  const fullOrg = await auth.api.getFullOrganization({ headers: reqHeaders });

  const org = fullOrg as { id: string; name: string; slug: string } | null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Company settings</h1>
        <p className="text-slate-400 text-sm mt-1">
          Workspace details and billing.
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-slate-500 uppercase">Name</p>
            <p className="text-white">{org?.name ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase">Slug</p>
            <p className="text-white font-mono">{org?.slug ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase">ID</p>
            <p className="text-slate-300 font-mono text-xs break-all">
              {org?.id ?? "—"}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h2 className="text-white font-semibold mb-2">Billing</h2>
        <p className="text-slate-500 text-sm">
          Stripe / billing integration goes here.
        </p>
      </div>
    </div>
  );
}
