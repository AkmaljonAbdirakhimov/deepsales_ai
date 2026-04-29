import { betterAuth } from "better-auth";
import { admin, organization } from "better-auth/plugins";
import { Pool } from "pg";

/**
 * Better Auth server instance.
 *
 * Plugins:
 *   - organization → tenants (companies). Roles per org: owner | admin | member.
 *   - admin        → super-admin operations: list users, ban, impersonate, etc.
 *
 * Rate limiting and IP detection are configured below to harden public
 * auth endpoints (sign-in, sign-up, password reset).
 *
 * Tables created/extended by Better Auth CLI (run: npm run db:migrate):
 *   user (with role, banned, banReason, banExpires fields from admin plugin),
 *   session (with impersonatedBy field), account, verification,
 *   organization, member, invitation, rateLimit (when storage is "database").
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
    /**
     * Public sign-up is disabled. Users are provisioned by:
     *   - the bootstrap script (super admin), and
     *   - the Super Admin / Company panels (admin createUser, org invitations).
     */
    disableSignUp: true,
  },

  /**
   * Security & observability.
   * - Window/max are global defaults; sensitive endpoints get stricter custom rules.
   * - Storage: "database" persists counters across restarts and instances.
   *   The CLI creates a `rateLimit` table on next migration.
   */
  rateLimit: {
    enabled: true,
    storage: "database",
    window: 60,
    max: 100,
    customRules: {
      "/sign-in/email": { window: 10, max: 5 },
      "/sign-up/email": { window: 60, max: 5 },
      "/request-password-reset": { window: 60, max: 3 },
      "/two-factor/*": { window: 10, max: 3 },
    },
  },

  advanced: {
    /**
     * Trust IP from common proxy headers. Behind Cloudflare/Nginx the real
     * client IP is in one of these headers; without this Better Auth would
     * rate-limit your reverse proxy.
     */
    ipAddress: {
      ipAddressHeaders: ["cf-connecting-ip", "x-forwarded-for", "x-real-ip"],
      // Treat IPv6 /64 as one client to prevent rotation-based bypass.
      ipv6Subnet: 64,
    },
  },

  plugins: [
    organization({
      /**
       * Roles available within every organization (tenant):
       *   owner   → company admin (full control)
       *   admin   → team lead
       *   member  → sales manager (read + own calls)
       */
      organizationLimit: 1,
      creatorRole: "owner",
      membershipLimit: 500,
    }),

    /**
     * Super-admin plugin.
     *
     * Two ways to mark a user as super-admin:
     *   1. Set `user.role = "admin"` in DB (the plugin adds this column).
     *   2. List the user ID in BETTER_AUTH_ADMIN_USER_IDS (comma-separated).
     *      Useful for the very first admin before any UI exists.
     *
     * Anyone with the admin role gets access to /admin/* endpoints
     * (createUser, listUsers, ban, impersonate, setRole, removeUser, …).
     */
    admin({
      adminUserIds:
        process.env.BETTER_AUTH_ADMIN_USER_IDS?.split(",")
          .map((s) => s.trim())
          .filter(Boolean) ?? [],
      defaultRole: "user",
      adminRoles: ["admin"],
    }),
  ],
});

export type Auth = typeof auth;
