import { betterAuth } from "better-auth";
import { admin, organization } from "better-auth/plugins";
import { Pool } from "pg";

/**
 * Better Auth instance for the NestJS API.
 * Must stay in sync with apps/web/src/lib/auth.ts.
 *
 * The NestJS integration (@thallesp/nestjs-better-auth) uses this instance
 * to validate sessions on every incoming request and expose the
 * Session + UserSession decorators to controllers.
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

  emailAndPassword: { enabled: true, disableSignUp: true },

  rateLimit: {
    enabled: true,
    storage: "database",
    window: 60,
    max: 100,
    customRules: {
      "/sign-in/email": { window: 10, max: 5 },
      "/sign-up/email": { window: 60, max: 5 },
      "/request-password-reset": { window: 60, max: 3 },
    },
  },

  advanced: {
    ipAddress: {
      ipAddressHeaders: ["cf-connecting-ip", "x-forwarded-for", "x-real-ip"],
      ipv6Subnet: 64,
    },
  },

  plugins: [
    organization({
      organizationLimit: 1,
      creatorRole: "owner",
      membershipLimit: 500,
    }),
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
