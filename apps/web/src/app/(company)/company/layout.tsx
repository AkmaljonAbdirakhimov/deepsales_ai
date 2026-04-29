import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { getAppSession, landingPathForSession } from "@/lib/session";

const navItems = [
  { label: "Overview", href: "/company" },
  { label: "Calls", href: "/company/calls" },
  { label: "Team", href: "/company/team" },
  { label: "Integrations", href: "/company/integrations" },
  { label: "Settings", href: "/company/settings" },
];

export default async function CompanyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAppSession();
  if (!session) redirect("/login");

  // Super admins land on /super-admin, members on /manager. Owners/admins stay.
  if (session.platformRole === "admin") redirect("/super-admin");
  if (!session.activeOrganizationId || !session.orgRole) redirect("/onboarding");
  if (session.orgRole !== "owner" && session.orgRole !== "admin") {
    redirect(landingPathForSession(session));
  }

  return (
    <div className="min-h-screen flex bg-slate-950">
      <Sidebar
        brandHref="/company"
        brandSubtitle="Company workspace"
        items={navItems}
      />
      <div className="flex-1 flex flex-col">
        <Topbar
          title="Company"
          subtitle={session.orgRole === "owner" ? "Owner" : "Admin"}
          user={{ name: session.name, email: session.email }}
          badge={session.orgRole === "owner" ? "OWNER" : "ADMIN"}
        />
        <main className="flex-1 p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
