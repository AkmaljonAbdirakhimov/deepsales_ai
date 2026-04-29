/**
 * Bootstraps the platform super admin.
 *
 * Reads SUPER_ADMIN_EMAIL / SUPER_ADMIN_PASSWORD / SUPER_ADMIN_NAME from .env
 * and ensures a user with role="admin" exists with those credentials.
 *
 * Idempotent: running it multiple times is safe.
 *   - If the user does not exist  → create it with role="admin".
 *   - If the user exists but is not admin → promote it.
 *   - If the user exists and is admin → no-op (password is NOT overwritten).
 *
 * Run:  npm run setup:super-admin
 *
 * Implementation notes:
 *   Public sign-up is disabled in auth config, so we cannot use auth.api.signUpEmail.
 *   We use auth.$context to access the internal adapter and password hasher,
 *   which is the documented way to seed users from a script.
 */
import { auth } from "../src/lib/auth";

interface ExistingUser {
  id: string;
  email: string;
  role: string | null;
}

async function main() {
  const email = process.env.SUPER_ADMIN_EMAIL?.trim();
  const password = process.env.SUPER_ADMIN_PASSWORD;
  const name = process.env.SUPER_ADMIN_NAME?.trim() || "Super Admin";

  if (!email || !password) {
    console.error(
      "SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD must be set in .env",
    );
    process.exit(1);
  }
  if (password.length < 8) {
    console.error("SUPER_ADMIN_PASSWORD must be at least 8 characters.");
    process.exit(1);
  }

  const ctx = await auth.$context;

  const existing = (await ctx.internalAdapter.findUserByEmail(email, {
    includeAccounts: true,
  })) as { user: ExistingUser; accounts: Array<{ providerId: string }> } | null;

  if (existing) {
    if (existing.user.role !== "admin") {
      await ctx.internalAdapter.updateUser(existing.user.id, { role: "admin" });
      console.log(`✓ Promoted existing user ${email} to super admin.`);
    } else {
      console.log(`✓ Super admin ${email} already exists. (no changes)`);
    }
    process.exit(0);
  }

  const hashedPassword = await ctx.password.hash(password);

  const created = (await ctx.internalAdapter.createUser({
    email,
    name,
    emailVerified: true,
    role: "admin",
  })) as { id: string };

  await ctx.internalAdapter.linkAccount({
    userId: created.id,
    providerId: "credential",
    accountId: created.id,
    password: hashedPassword,
  });

  console.log(`✓ Created super admin ${email} (id=${created.id}).`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Failed to set up super admin:");
  console.error(err);
  process.exit(1);
});
