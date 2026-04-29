"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "company";
}

export default function OnboardingPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const slug = `${slugify(name)}-${Math.random().toString(36).slice(2, 6)}`;
      const { data: org, error: createErr } = await authClient.organization.create({
        name,
        slug,
      });
      if (createErr || !org) {
        setError(createErr?.message ?? "Failed to create company.");
        return;
      }
      const { error: setErr } = await authClient.organization.setActive({
        organizationId: org.id,
      });
      if (setErr) {
        setError(setErr.message ?? "Failed to activate company.");
        return;
      }
      router.replace("/company");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error.");
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    await authClient.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold text-white">Create your company</h1>
          <p className="text-slate-400 text-sm">
            One workspace per company. You can invite teammates after.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="name" className="text-sm text-slate-300">
              Company name
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Acme Sales"
              className="w-full px-4 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-950/40 border border-red-900 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white rounded-lg font-medium transition-colors"
          >
            {busy ? "Creating…" : "Create company"}
          </button>
        </form>

        <button
          onClick={signOut}
          className="w-full text-center text-sm text-slate-400 hover:text-slate-200"
        >
          Sign out
        </button>
      </div>
    </main>
  );
}
