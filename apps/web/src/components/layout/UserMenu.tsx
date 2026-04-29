"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

interface UserMenuProps {
  name: string;
  email: string;
  badge?: string;
}

export function UserMenu({ name, email, badge }: UserMenuProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function signOut() {
    setBusy(true);
    try {
      await authClient.signOut();
      router.replace("/login");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <div className="text-right leading-tight">
        <p className="text-sm font-medium text-white">{name}</p>
        <p className="text-xs text-slate-400">{email}</p>
      </div>
      {badge && (
        <span className="px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
          {badge}
        </span>
      )}
      <button
        onClick={signOut}
        disabled={busy}
        className="px-3 py-1.5 text-sm rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-60 text-slate-200"
      >
        {busy ? "Signing out…" : "Sign out"}
      </button>
    </div>
  );
}
