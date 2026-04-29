/**
 * Read a required env var. Throws at module load time if missing.
 * Used to fail fast instead of silently falling back to a wrong default.
 */
export function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v || v.length === 0) {
    throw new Error(
      `Missing required environment variable: ${name}. ` +
        `Set it in .env (root) before starting the app.`,
    );
  }
  return v;
}
