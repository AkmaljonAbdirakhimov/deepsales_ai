"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  generateOwnerEmailFromSlug,
  generateStrongPassword,
  slugifyOrganizationName,
} from "@/lib/provisioning/generators";

interface ProvisionResponse {
  organization: { id: string; name: string; slug: string };
  owner: { id: string; name: string; email: string };
  generated: { slug: string; email: string; password: string };
}

export function ProvisionOrganizationForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [organizationName, setOrganizationName] = useState("");
  const generatedSlug = useMemo(
    () => slugifyOrganizationName(organizationName),
    [organizationName],
  );
  const generatedEmail = useMemo(
    () => generateOwnerEmailFromSlug(generatedSlug),
    [generatedSlug],
  );

  const [organizationSlug, setOrganizationSlug] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerPassword, setOwnerPassword] = useState(() => generateStrongPassword());

  const [editedSlug, setEditedSlug] = useState(false);
  const [editedEmail, setEditedEmail] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<ProvisionResponse | null>(null);

  const effectiveSlug = editedSlug ? organizationSlug : generatedSlug;
  const effectiveEmail = editedEmail ? ownerEmail : generatedEmail;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLastResult(null);

    const payload = {
      organizationName,
      organizationSlug: effectiveSlug,
      ownerName: ownerName.trim() || `${organizationName.trim()} Admin`,
      ownerEmail: effectiveEmail,
      ownerPassword,
    };

    startTransition(async () => {
      const res = await fetch("/api/super-admin/provision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as ProvisionResponse | { error?: string };
      if (!res.ok) {
        setError((data as { error?: string }).error ?? "Provisioning failed.");
        return;
      }
      setLastResult(data as ProvisionResponse);
      router.refresh();
    });
  }

  return (
    <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
      <div>
        <h2 className="text-white font-semibold">Create organization + owner</h2>
        <p className="text-xs text-slate-400 mt-1">
          Type organization name and slug/email/password are auto-generated.
        </p>
      </div>

      <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="space-y-1 md:col-span-2">
          <span className="text-xs text-slate-400">Organization name</span>
          <input
            required
            value={organizationName}
            onChange={(e) => setOrganizationName(e.target.value)}
            placeholder="Acme Sales"
            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </label>

        <label className="space-y-1">
          <span className="text-xs text-slate-400">Organization slug</span>
          <input
            required
            value={effectiveSlug}
            onChange={(e) => {
              setEditedSlug(true);
              setOrganizationSlug(slugifyOrganizationName(e.target.value));
            }}
            placeholder="acme-sales"
            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </label>

        <label className="space-y-1">
          <span className="text-xs text-slate-400">Owner name</span>
          <input
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
            placeholder="Acme Admin"
            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </label>

        <label className="space-y-1">
          <span className="text-xs text-slate-400">Owner email</span>
          <input
            required
            type="email"
            value={effectiveEmail}
            onChange={(e) => {
              setEditedEmail(true);
              setOwnerEmail(e.target.value.toLowerCase());
            }}
            placeholder="admin@acme-sales.local"
            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </label>

        <label className="space-y-1">
          <span className="text-xs text-slate-400">Temporary password</span>
          <div className="flex gap-2">
            <input
              required
              value={ownerPassword}
              onChange={(e) => setOwnerPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => setOwnerPassword(generateStrongPassword())}
              className="px-3 py-2 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
            >
              Regenerate
            </button>
          </div>
        </label>

        <div className="md:col-span-2 flex items-center gap-3">
          <button
            type="submit"
            disabled={pending}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-sm text-white font-medium"
          >
            {pending ? "Creating..." : "Create organization + owner"}
          </button>
          <button
            type="button"
            onClick={() => {
              setEditedSlug(false);
              setEditedEmail(false);
              setOrganizationSlug("");
              setOwnerEmail("");
              setOwnerPassword(generateStrongPassword());
            }}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm text-slate-200"
          >
            Reset auto values
          </button>
        </div>
      </form>

      {error && (
        <p className="text-sm text-red-400 bg-red-950/40 border border-red-900 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {lastResult && (
        <div className="text-sm bg-emerald-950/30 border border-emerald-900 rounded-lg p-3 space-y-1">
          <p className="text-emerald-300 font-medium">Provisioning completed.</p>
          <p className="text-slate-300">
            Org: <span className="font-mono">{lastResult.organization.slug}</span> | Owner:{" "}
            <span className="font-mono">{lastResult.owner.email}</span>
          </p>
          <p className="text-slate-400 text-xs">
            Save this temporary password now:{" "}
            <span className="font-mono text-slate-200">{lastResult.generated.password}</span>
          </p>
        </div>
      )}
    </section>
  );
}
