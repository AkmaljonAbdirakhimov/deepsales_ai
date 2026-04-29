import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { UsersTable } from "@/components/admin/UsersTable";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  // Server-side initial fetch — keeps the first render fast and avoids a
  // browser flicker. Client component handles refresh / actions afterwards.
  const result = await auth.api.listUsers({
    headers: await headers(),
    query: { limit: 100, sortBy: "createdAt", sortDirection: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Users</h1>
        <p className="text-slate-400 text-sm mt-1">
          All users across all organizations.
        </p>
      </div>

      <UsersTable initialUsers={result.users} initialTotal={result.total} />
    </div>
  );
}
