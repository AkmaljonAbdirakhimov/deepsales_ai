"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role?: string | null;
  banned?: boolean | null;
  banReason?: string | null;
  createdAt: string | Date;
}

export function UsersTable({
  initialUsers,
  initialTotal,
}: {
  initialUsers: AdminUser[];
  initialTotal: number;
}) {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  async function refresh(searchValue?: string) {
    const { data } = await authClient.admin.listUsers({
      query: {
        limit: 100,
        sortBy: "createdAt",
        sortDirection: "desc",
        ...(searchValue
          ? {
              searchValue,
              searchField: "email" as const,
              searchOperator: "contains" as const,
            }
          : {}),
      },
    });
    if (data?.users) setUsers(data.users as AdminUser[]);
  }

  async function handleBan(user: AdminUser) {
    const reason = window.prompt(`Ban reason for ${user.email}?`, "Policy violation");
    if (reason === null) return;
    setBusyId(user.id);
    try {
      await authClient.admin.banUser({ userId: user.id, banReason: reason });
      await refresh(search);
    } finally {
      setBusyId(null);
    }
  }

  async function handleUnban(user: AdminUser) {
    setBusyId(user.id);
    try {
      await authClient.admin.unbanUser({ userId: user.id });
      await refresh(search);
    } finally {
      setBusyId(null);
    }
  }

  async function handleImpersonate(user: AdminUser) {
    setBusyId(user.id);
    try {
      await authClient.admin.impersonateUser({ userId: user.id });
      // Reload — the session cookie now belongs to the impersonated user.
      startTransition(() => {
        router.push("/dashboard");
        router.refresh();
      });
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(user: AdminUser) {
    if (!window.confirm(`Permanently delete ${user.email}?`)) return;
    setBusyId(user.id);
    try {
      await authClient.admin.removeUser({ userId: user.id });
      await refresh(search);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <input
          type="text"
          placeholder="Search by email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") refresh(search);
          }}
          className="flex-1 max-w-sm px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={() => refresh(search)}
          className="px-4 py-2 text-sm rounded-lg bg-slate-800 hover:bg-slate-700"
        >
          Search
        </button>
        <span className="text-xs text-slate-500 ml-auto">
          {users.length} of {initialTotal} users
        </span>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-950 text-slate-400 text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-3 font-medium">User</th>
              <th className="text-left px-4 py-3 font-medium">Role</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-left px-4 py-3 font-medium">Created</th>
              <th className="text-right px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-950/50">
                <td className="px-4 py-3">
                  <p className="font-medium text-white">{u.name || "—"}</p>
                  <p className="text-xs text-slate-500">{u.email}</p>
                </td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 text-xs rounded bg-slate-800 text-slate-300">
                    {u.role ?? "user"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {u.banned ? (
                    <span
                      title={u.banReason ?? ""}
                      className="px-2 py-0.5 text-xs rounded bg-red-950 text-red-300"
                    >
                      Banned
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 text-xs rounded bg-emerald-950 text-emerald-300">
                      Active
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-400 text-xs">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                  <button
                    disabled={busyId === u.id}
                    onClick={() => handleImpersonate(u)}
                    className="text-xs text-blue-400 hover:text-blue-300 disabled:opacity-40"
                  >
                    Impersonate
                  </button>
                  {u.banned ? (
                    <button
                      disabled={busyId === u.id}
                      onClick={() => handleUnban(u)}
                      className="text-xs text-emerald-400 hover:text-emerald-300 disabled:opacity-40"
                    >
                      Unban
                    </button>
                  ) : (
                    <button
                      disabled={busyId === u.id}
                      onClick={() => handleBan(u)}
                      className="text-xs text-amber-400 hover:text-amber-300 disabled:opacity-40"
                    >
                      Ban
                    </button>
                  )}
                  <button
                    disabled={busyId === u.id}
                    onClick={() => handleDelete(u)}
                    className="text-xs text-red-400 hover:text-red-300 disabled:opacity-40"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {users.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-12 text-center text-slate-500 text-sm"
                >
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
