import { headers } from "next/headers";
import { auth } from "./auth";

export type PlatformRole = "admin" | "user";
export type OrgRole = "owner" | "admin" | "member";

export interface AppSession {
  userId: string;
  email: string;
  name: string;
  /** Platform role from Better Auth admin plugin. "admin" = super admin. */
  platformRole: PlatformRole;
  /** Active organization on the session, if any. */
  activeOrganizationId: string | null;
  /** Role inside the active organization, if there is one. */
  orgRole: OrgRole | null;
}

/**
 * Server-side session helper.
 * Returns null when the user is not signed in.
 *
 * Determines:
 *   - platformRole: from user.role (admin plugin)
 *   - activeOrganizationId: from session.activeOrganizationId (org plugin)
 *   - orgRole: looked up via auth.api.getActiveMember when an active org is set
 */
export async function getAppSession(): Promise<AppSession | null> {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({ headers: reqHeaders });
  if (!session) return null;

  const user = session.user as {
    id: string;
    email: string;
    name: string;
    role?: string | null;
  };
  const platformRole: PlatformRole = user.role === "admin" ? "admin" : "user";

  const activeOrganizationId =
    (session.session as { activeOrganizationId?: string | null })
      .activeOrganizationId ?? null;

  let orgRole: OrgRole | null = null;
  if (activeOrganizationId) {
    try {
      const member = await auth.api.getActiveMember({ headers: reqHeaders });
      const role = (member as { role?: string } | null)?.role ?? null;
      if (role === "owner" || role === "admin" || role === "member") {
        orgRole = role;
      }
    } catch {
      // No active member (e.g. just signed up, no org yet) — leave orgRole null.
    }
  }

  return {
    userId: user.id,
    email: user.email,
    name: user.name,
    platformRole,
    activeOrganizationId,
    orgRole,
  };
}

/**
 * Returns the URL the user should land on after sign-in.
 *
 *   platform admin       → /super-admin
 *   org owner / admin    → /company
 *   org member           → /manager
 *   no org yet           → /onboarding (create or join org)
 */
export function landingPathForSession(session: AppSession): string {
  if (session.platformRole === "admin") return "/super-admin";
  if (!session.activeOrganizationId || !session.orgRole) return "/onboarding";
  if (session.orgRole === "owner" || session.orgRole === "admin") return "/company";
  return "/manager";
}
