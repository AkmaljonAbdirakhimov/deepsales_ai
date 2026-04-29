import { createAuthClient } from "better-auth/react";
import {
  adminClient,
  organizationClient,
} from "better-auth/client/plugins";

/**
 * Browser-side auth client.
 *
 * Examples:
 *   const { data: session } = authClient.useSession()
 *   await authClient.signIn.email({ email, password })
 *   await authClient.signOut()
 *
 *   // Organization (tenant) operations
 *   await authClient.organization.create({ name, slug })
 *   await authClient.organization.inviteMember({ email, role: "member" })
 *
 *   // Admin (super-admin) operations
 *   await authClient.admin.listUsers({ query: { limit: 50 } })
 *   await authClient.admin.banUser({ userId, banReason: "spam" })
 *   await authClient.admin.impersonateUser({ userId })
 */
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  plugins: [organizationClient(), adminClient()],
});

export const { signIn, signUp, signOut, useSession } = authClient;
