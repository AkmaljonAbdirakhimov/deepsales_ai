import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { TeamPanel } from "@/components/company/TeamPanel";

export default async function TeamPage() {
  const reqHeaders = await headers();
  const fullOrg = await auth.api.getFullOrganization({ headers: reqHeaders });

  const members =
    (fullOrg as { members?: Array<{
      id: string;
      role: string;
      user: { id: string; name: string; email: string };
    }> } | null)?.members ?? [];

  const invitations =
    (fullOrg as { invitations?: Array<{
      id: string;
      email: string;
      role: string;
      status: string;
      expiresAt: string | Date;
    }> } | null)?.invitations ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Team</h1>
        <p className="text-slate-400 text-sm mt-1">
          Invite managers, manage roles, remove members.
        </p>
      </div>
      <TeamPanel
        members={members.map((m) => ({
          id: m.id,
          role: m.role,
          name: m.user.name,
          email: m.user.email,
          userId: m.user.id,
        }))}
        invitations={invitations.map((i) => ({
          id: i.id,
          email: i.email,
          role: i.role,
          status: i.status,
          expiresAt:
            typeof i.expiresAt === "string"
              ? i.expiresAt
              : i.expiresAt.toISOString(),
        }))}
      />
    </div>
  );
}
