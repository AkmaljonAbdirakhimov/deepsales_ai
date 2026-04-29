import { getDbPool } from "@/lib/db";

export const dynamic = "force-dynamic";

interface OrgRow {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
  member_count: string;
}

export default async function OrganizationsPage() {
  const pool = getDbPool();

  // Better Auth's organization plugin tables: organization, member.
  // We aggregate member counts in one query.
  const { rows } = await pool.query<OrgRow>(`
    SELECT
      o.id,
      o.name,
      o.slug,
      o."createdAt",
      COUNT(m.id) AS member_count
    FROM organization o
    LEFT JOIN member m ON m."organizationId" = o.id
    GROUP BY o.id
    ORDER BY o."createdAt" DESC
    LIMIT 200
  `);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Organizations</h1>
        <p className="text-slate-400 text-sm mt-1">
          Tenants on the platform. {rows.length} shown.
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-950 text-slate-400 text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Organization</th>
              <th className="text-left px-4 py-3 font-medium">Slug</th>
              <th className="text-left px-4 py-3 font-medium">Members</th>
              <th className="text-left px-4 py-3 font-medium">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {rows.map((o) => (
              <tr key={o.id} className="hover:bg-slate-950/50">
                <td className="px-4 py-3">
                  <p className="font-medium text-white">{o.name}</p>
                  <p className="text-xs text-slate-500 font-mono">{o.id}</p>
                </td>
                <td className="px-4 py-3 text-slate-400 font-mono text-xs">
                  {o.slug}
                </td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 text-xs rounded bg-slate-800 text-slate-300">
                    {o.member_count}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-400 text-xs">
                  {new Date(o.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-12 text-center text-slate-500 text-sm"
                >
                  No organizations yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
