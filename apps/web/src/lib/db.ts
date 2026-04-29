import { Pool } from "pg";

/**
 * Shared Postgres pool for app-side reads (super-admin queries, etc.).
 * Better Auth uses its own pool internally; this one is for our queries
 * that go beyond the auth API surface (e.g. listing all orgs across tenants).
 */
let _pool: Pool | null = null;

export function getDbPool(): Pool {
  if (!_pool) {
    _pool = new Pool({
      host: process.env.DB_HOST ?? "localhost",
      port: Number(process.env.DB_PORT ?? 5432),
      user: process.env.DB_USER ?? "postgres",
      password: process.env.DB_PASSWORD ?? "postgres",
      database: process.env.DB_NAME ?? "deepsales",
      max: 5,
    });
  }
  return _pool;
}
