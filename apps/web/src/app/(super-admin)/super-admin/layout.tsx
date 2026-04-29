import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { getAppSession } from "@/lib/session";

const navItems = [
  { label: "Users", href: "/super-admin/users" },
  { label: "Organizations", href: "/super-admin/organizations" },
];

/**
 * Server-side guard for the Super Admin section.
 * Only users whose Better Auth `role` is "admin" (or are listed in
 * BETTER_AUTH_ADMIN_USER_IDS via the admin plugin) may pass.
 */
export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAppSession();
  if (!session) redirect("/login");
  if (session.platformRole !== "admin") redirect("/dashboard");

  return (
    <div className="min-h-screen flex bg-slate-950">
      <Sidebar
        brandHref="/super-admin"
        brandSubtitle="Super Admin"
        items={navItems}
      />
      <div className="flex-1 flex flex-col">
        <Topbar
          title="Super Admin"
          user={{ name: session.name, email: session.email }}
          badge="SUPER ADMIN"
        />
        <main className="flex-1 p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
