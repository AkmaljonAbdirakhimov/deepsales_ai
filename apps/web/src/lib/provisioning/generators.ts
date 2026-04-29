const AMBIGUOUS_CHARS = /[O0Il]/g;

export function slugifyOrganizationName(name: string): string {
  const normalized = name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    // Omit apostrophes instead of turning them into dashes: ta'lim -> talim
    .replace(/['’`´]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return (normalized || "organization").slice(0, 50);
}

export function generateOwnerEmailFromSlug(slug: string): string {
  return `admin@${slug || "organization"}.local`;
}

function randomCharFrom(charset: string): string {
  const idx = Math.floor(Math.random() * charset.length);
  return charset[idx] ?? "x";
}

/**
 * Server-safe strong temporary password generator.
 * We intentionally avoid ambiguous characters for easier copy/read.
 */
export function generateStrongPassword(length = 20): string {
  const uppercase = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lowercase = "abcdefghjkmnpqrstuvwxyz";
  const numbers = "23456789";
  const symbols = "!@#$%^&*()-_=+[]{}";
  const all = `${uppercase}${lowercase}${numbers}${symbols}`;

  const required = [
    randomCharFrom(uppercase),
    randomCharFrom(lowercase),
    randomCharFrom(numbers),
    randomCharFrom(symbols),
  ];

  const restLength = Math.max(length - required.length, 8);
  const rest = Array.from({ length: restLength }, () => randomCharFrom(all));
  const merged = [...required, ...rest];

  for (let i = merged.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [merged[i], merged[j]] = [merged[j]!, merged[i]!];
  }

  return merged.join("").replace(AMBIGUOUS_CHARS, "x");
}
