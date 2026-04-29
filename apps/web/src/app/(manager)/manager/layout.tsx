import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { getAppSession, landingPathForSession } from "@/lib/session";

const navItems = [
  { label: "My calls", href: "/manager" },
];

export default async function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAppSession();
  if (!session) redirect("/login");

  if (session.platformRole === "admin") redirect("/super-admin");
  if (!session.activeOrganizationId || !session.orgRole) redirect("/onboarding");
  // Owners/admins should be on /company. Only "member" stays on /manager.
  if (session.orgRole !== "member") redirect(landingPathForSession(session));

  return (
    <div className="min-h-screen flex bg-slate-950">
      <Sidebar
        brandHref="/manager"
        brandSubtitle="Manager workspace"
        items={navItems}
      />
      <div className="flex-1 flex flex-col">
        <Topbar
          title="Manager"
          user={{ name: session.name, email: session.email }}
          badge="MANAGER"
        />
        <main className="flex-1 p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
