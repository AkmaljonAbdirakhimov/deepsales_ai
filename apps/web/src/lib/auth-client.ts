import { createAuthClient } from "better-auth/react";
import { organizationClient } from "better-auth/client/plugins";

/**
 * Browser-side auth client.
 *
 * Usage examples:
 *   const { data: session } = authClient.useSession()
 *   await authClient.signIn.email({ email, password })
 *   await authClient.signOut()
 *   await authClient.organization.create({ name, slug })
 *   await authClient.organization.inviteMember({ email, role: "member" })
 */
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  plugins: [organizationClient()],
});

export const { signIn, signUp, signOut, useSession } = authClient;
