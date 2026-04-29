"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { authClient } from "@/lib/auth-client";

export interface TeamMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: string;
}

export interface TeamInvitation {
  id: string;
  email: string;
  role: string;
  status: string;
  expiresAt: string;
}

interface TeamPanelProps {
  members: TeamMember[];
  invitations: TeamInvitation[];
}

export function TeamPanel({ members, invitations }: TeamPanelProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"member" | "admin">("member");

  function refresh() {
    startTransition(() => router.refresh());
  }

  async function inviteMember(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const { error } = await authClient.organization.inviteMember({
      email: inviteEmail,
      role: inviteRole,
    });
    if (error) {
      setError(error.message ?? "Failed to invite.");
      return;
    }
    setInviteEmail("");
    refresh();
  }

  async function updateRole(memberId: string, role: "member" | "admin" | "owner") {
    setError(null);
    const { error } = await authClient.organization.updateMemberRole({
      memberId,
      role,
    });
    if (error) {
      setError(error.message ?? "Failed to update role.");
      return;
    }
    refresh();
  }

  async function removeMember(memberIdOrEmail: string) {
    if (!confirm("Remove this member from the company?")) return;
    setError(null);
    const { error } = await authClient.organization.removeMember({
      memberIdOrEmail,
    });
    if (error) {
      setError(error.message ?? "Failed to remove.");
      return;
    }
    refresh();
  }

  async function cancelInvitation(invitationId: string) {
    setError(null);
    const { error } = await authClient.organization.cancelInvitation({
      invitationId,
    });
    if (error) {
      setError(error.message ?? "Failed to cancel invite.");
      return;
    }
    refresh();
  }

  return (
    <div className="space-y-8">
      {error && (
        <p className="text-sm text-red-400 bg-red-950/40 border border-red-900 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <h2 className="text-white font-semibold">Invite a teammate</h2>
        <form onSubmit={inviteMember} className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            required
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="teammate@company.com"
            className="flex-1 px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value as "member" | "admin")}
            className="px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="member">Manager</option>
            <option value="admin">Company admin</option>
          </select>
          <button
            type="submit"
            disabled={pending}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white rounded-lg font-medium"
          >
            Send invite
          </button>
        </form>
      </section>

      <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <h2 className="text-white font-semibold">Members</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Email</th>
                <th className="py-2 pr-4">Role</th>
                <th className="py-2 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id} className="border-b border-slate-800/60">
                  <td className="py-2 pr-4 text-white">{m.name}</td>
                  <td className="py-2 pr-4 text-slate-300">{m.email}</td>
                  <td className="py-2 pr-4">
                    <select
                      value={m.role}
                      onChange={(e) =>
                        updateRole(
                          m.id,
                          e.target.value as "member" | "admin" | "owner",
                        )
                      }
                      className="bg-slate-950 border border-slate-700 text-slate-200 rounded-md px-2 py-1"
                    >
                      <option value="member">Manager</option>
                      <option value="admin">Admin</option>
                      <option value="owner">Owner</option>
                    </select>
                  </td>
                  <td className="py-2 pr-4 text-right">
                    <button
                      onClick={() => removeMember(m.id)}
                      className="px-2 py-1 text-xs rounded-md bg-red-900/40 text-red-300 hover:bg-red-900/70"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <h2 className="text-white font-semibold">Pending invitations</h2>
        {invitations.length === 0 ? (
          <p className="text-slate-500 text-sm">No pending invitations.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-2 pr-4">Email</th>
                  <th className="py-2 pr-4">Role</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Expires</th>
                  <th className="py-2 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invitations.map((i) => (
                  <tr key={i.id} className="border-b border-slate-800/60">
                    <td className="py-2 pr-4 text-white">{i.email}</td>
                    <td className="py-2 pr-4 text-slate-300">{i.role}</td>
                    <td className="py-2 pr-4 text-slate-300">{i.status}</td>
                    <td className="py-2 pr-4 text-slate-400">
                      {new Date(i.expiresAt).toLocaleString()}
                    </td>
                    <td className="py-2 pr-4 text-right">
                      <button
                        onClick={() => cancelInvitation(i.id)}
                        className="px-2 py-1 text-xs rounded-md bg-slate-800 text-slate-200 hover:bg-slate-700"
                      >
                        Cancel
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
