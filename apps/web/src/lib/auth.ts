import { betterAuth } from "better-auth";
import { organization } from "better-auth/plugins";
import { Pool } from "pg";

/**
 * Better Auth server instance.
 *
 * Organizations plugin maps to our "tenants":
 *   - organization  = company (tenant)
 *   - member roles  = owner (company admin) | admin | member (manager)
 *
 * Tables created by Better Auth CLI (run: npx auth migrate):
 *   user, session, account, verification,
 *   organization, member, invitation
 */
export const auth = betterAuth({
  database: new Pool({
    host: process.env.DB_HOST ?? "localhost",
    port: Number(process.env.DB_PORT ?? 5432),
    user: process.env.DB_USER ?? "postgres",
    password: process.env.DB_PASSWORD ?? "postgres",
    database: process.env.DB_NAME ?? "deepsales",
  }),

  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",

  emailAndPassword: {
    enabled: true,
  },

  plugins: [
    organization({
      /**
       * Roles available within every organization (tenant):
       *   owner   → company admin (full control)
       *   admin   → team lead
       *   member  → sales manager (read + own calls)
       */
      organizationLimit: 1,          // one org per user by default; relax for super admin
      creatorRole: "owner",
      membershipLimit: 500,
    }),
  ],
});

export type Auth = typeof auth;
