import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

function secret(name: "AUTH_SECRET" | "HASH_SALT"): string {
  const value = process.env[name];
  if (value && value.length >= 8) return value;
  if (process.env.NODE_ENV === "production" && process.env.CI !== "true") {
    throw new Error(name + " must be set in production");
  }
  return "dev-only-" + name;
}

export function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

/** Keyed hash for secrets we must compare later (OTP codes). */
export function hmac(value: string): string {
  return createHmac("sha256", secret("AUTH_SECRET")).update(value).digest("hex");
}

/** One-way, salted hash of an IP address (POPIA minimisation: raw IPs are never stored). */
export function hashIp(ip: string | null | undefined): string {
  return sha256(secret("HASH_SALT") + ":ip:" + (ip ?? "unknown"));
}

/** URL-safe random token with `bytes` of entropy. */
export function randomToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}

export function safeEqualHex(a: string, b: string): boolean {
  const ab = Buffer.from(a, "hex");
  const bb = Buffer.from(b, "hex");
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

/**
 * One-way, salted learner hash for the anonymised InterestSignal stream (PRD 9.3). The salt
 * rotates every quarter (`period`, e.g. "2026Q4"), so hashes cannot be joined across quarters;
 * within a quarter they only de-duplicate signals. Never store this next to a learner id.
 */
export function learnerSignalHash(learnerId: string, period: string): string {
  return sha256(secret("HASH_SALT") + ":signal:" + period + ":" + learnerId);
}
