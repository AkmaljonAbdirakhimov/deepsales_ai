import { redirect } from "next/navigation";
import { getAppSession, landingPathForSession } from "@/lib/session";

/**
 * Generic post-login landing page. Sends the user to the panel that matches
 * their role (super-admin / company / manager) or to onboarding.
 */
export default async function DashboardRedirector() {
  const session = await getAppSession();
  if (!session) redirect("/login");
  redirect(landingPathForSession(session));
}
