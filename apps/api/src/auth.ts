import { betterAuth } from "better-auth";
import { organization } from "better-auth/plugins";
import { Pool } from "pg";

/**
 * Shared Better Auth instance for the NestJS API.
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

  emailAndPassword: { enabled: true },

  plugins: [
    organization({
      organizationLimit: 1,
      creatorRole: "owner",
      membershipLimit: 500,
    }),
  ],
});

export type Auth = typeof auth;
