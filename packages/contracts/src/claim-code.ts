import { randomInt } from "node:crypto";

/** Crockford base32 alphabet: digits + letters without I, L, O, U. */
export const CROCKFORD_ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
export const CLAIM_CODE_LENGTH = 6;

/** Random 6-char claim code (32^6 ≈ 1.07 billion). Uniqueness is enforced by the DB. */
export function generateClaimCode(rand: (max: number) => number = randomInt): string {
  let out = "";
  for (let i = 0; i < CLAIM_CODE_LENGTH; i++) out += CROCKFORD_ALPHABET[rand(32)];
  return out;
}

/**
 * Normalise user input to a canonical code: case-insensitive, hyphens/spaces ignored,
 * Crockford aliases I/L→1 and O→0. Returns null when it cannot be a valid code.
 */
export function normaliseClaimCode(input: string): string | null {
  const cleaned = input
    .toUpperCase()
    .replace(/[\s-]/g, "")
    .replace(/[IL]/g, "1")
    .replace(/O/g, "0");
  if (cleaned.length !== CLAIM_CODE_LENGTH) return null;
  for (const ch of cleaned) if (!CROCKFORD_ALPHABET.includes(ch)) return null;
  return cleaned;
}

/** Display form for kiosk screens and cards: K7Q-4MX. */
export function formatClaimCode(code: string): string {
  return code.slice(0, 3) + "-" + code.slice(3);
}
