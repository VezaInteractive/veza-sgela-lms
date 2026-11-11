import { randomInt } from "node:crypto";

/** L-ON-2 rules. Per-hour limits are env-configurable so e2e runs on one IP do not trip them. */
export interface OtpLimits {
  ttlMs: number;
  maxAttempts: number;
  resendAfterMs: number;
  maxSendsPerIdentityPerHour: number;
  maxSendsPerIpPerHour: number;
}

function envInt(name: string, fallback: number): number {
  const n = Number(process.env[name]);
  return Number.isInteger(n) && n > 0 ? n : fallback;
}

export function otpLimits(): OtpLimits {
  return {
    ttlMs: 5 * 60_000,
    maxAttempts: 5,
    resendAfterMs: 30_000,
    maxSendsPerIdentityPerHour: envInt(
      "OTP_MAX_SENDS_PER_EMAIL_PER_HOUR",
      envInt("OTP_MAX_SENDS_PER_PHONE_PER_HOUR", 5),
    ),
    maxSendsPerIpPerHour: envInt("OTP_MAX_SENDS_PER_IP_PER_HOUR", 20),
  };
}

export const HOUR_MS = 60 * 60_000;

export function generateOtpCode(rand: (max: number) => number = randomInt): string {
  return String(rand(1_000_000)).padStart(6, "0");
}

export type SendDecision =
  | { ok: true }
  | {
      ok: false;
      code: "RESEND_TOO_SOON" | "IDENTITY_RATE_LIMITED" | "IP_RATE_LIMITED";
      retryAfterSec: number;
    };

export interface SendHistory {
  /** createdAt of challenges for this identity (email) in the last hour, any order. */
  identitySends: Date[];
  /** createdAt of challenges from this IP hash in the last hour. */
  ipSends: Date[];
}

export function checkSendAllowed(
  history: SendHistory,
  now: Date,
  limits = otpLimits(),
): SendDecision {
  const since = now.getTime() - HOUR_MS;
  const identity = history.identitySends
    .map((d) => d.getTime())
    .filter((t) => t > since)
    .sort((a, b) => a - b);
  const ip = history.ipSends
    .map((d) => d.getTime())
    .filter((t) => t > since)
    .sort((a, b) => a - b);

  const last = identity.at(-1);
  if (last !== undefined && now.getTime() - last < limits.resendAfterMs) {
    return {
      ok: false,
      code: "RESEND_TOO_SOON",
      retryAfterSec: Math.ceil((last + limits.resendAfterMs - now.getTime()) / 1000),
    };
  }
  if (identity.length >= limits.maxSendsPerIdentityPerHour) {
    const oldest = identity[identity.length - limits.maxSendsPerIdentityPerHour]!;
    return {
      ok: false,
      code: "IDENTITY_RATE_LIMITED",
      retryAfterSec: Math.ceil((oldest + HOUR_MS - now.getTime()) / 1000),
    };
  }
  if (ip.length >= limits.maxSendsPerIpPerHour) {
    const oldest = ip[ip.length - limits.maxSendsPerIpPerHour]!;
    return {
      ok: false,
      code: "IP_RATE_LIMITED",
      retryAfterSec: Math.ceil((oldest + HOUR_MS - now.getTime()) / 1000),
    };
  }
  return { ok: true };
}

export interface ChallengeState {
  attempts: number;
  expiresAt: Date;
  consumedAt: Date | null;
}

export type VerifyDecision =
  | { ok: true }
  | { ok: false; code: "NO_CHALLENGE" | "EXPIRED" | "TOO_MANY_ATTEMPTS" }
  | { ok: false; code: "WRONG_CODE"; attemptsLeft: number };

/** Decide a verify attempt. `matches` is the constant-time comparison result. */
export function evaluateVerify(
  challenge: ChallengeState | null,
  matches: boolean,
  now: Date,
  limits = otpLimits(),
): VerifyDecision {
  if (!challenge || challenge.consumedAt) return { ok: false, code: "NO_CHALLENGE" };
  if (challenge.attempts >= limits.maxAttempts) return { ok: false, code: "TOO_MANY_ATTEMPTS" };
  if (now.getTime() >= challenge.expiresAt.getTime()) return { ok: false, code: "EXPIRED" };
  if (!matches) {
    const left = limits.maxAttempts - (challenge.attempts + 1);
    return left > 0
      ? { ok: false, code: "WRONG_CODE", attemptsLeft: left }
      : { ok: false, code: "TOO_MANY_ATTEMPTS" };
  }
  return { ok: true };
}
