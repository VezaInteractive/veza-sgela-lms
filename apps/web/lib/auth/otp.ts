import { getDb, type PrismaClient } from "@sgela/db";
import { getEmailProvider, type EmailProvider } from "@sgela/messaging";
import { hashIp, hmac, safeEqualHex } from "@/lib/crypto";
import {
  HOUR_MS,
  checkSendAllowed,
  evaluateVerify,
  generateOtpCode,
  otpLimits,
  type SendDecision,
  type VerifyDecision,
} from "./otp-rules";

const codeHash = (email: string, code: string) => hmac("otp:" + email + ":" + code);

export interface RequestOtpInput {
  email: string;
  ip: string | null;
  /** Localised email subject line. */
  subject: string;
  /** Localised email body; receives the code. */
  message: (code: string) => string;
  now?: Date;
  db?: PrismaClient;
  mailer?: EmailProvider;
  rand?: (max: number) => number;
}

/** Send a 6-digit code to an email (L-ON-2, D-039). Rate limits counted from OtpChallenge rows. */
export async function requestOtp(input: RequestOtpInput): Promise<SendDecision> {
  const db = input.db ?? getDb();
  const now = input.now ?? new Date();
  const limits = otpLimits();
  const ipHash = hashIp(input.ip);
  const since = new Date(now.getTime() - HOUR_MS);

  const [emailRows, ipRows] = await Promise.all([
    db.otpChallenge.findMany({
      where: { email: input.email, createdAt: { gt: since } },
      select: { createdAt: true },
    }),
    db.otpChallenge.findMany({
      where: { ipHash, createdAt: { gt: since } },
      select: { createdAt: true },
    }),
  ]);
  const decision = checkSendAllowed(
    { identitySends: emailRows.map((r) => r.createdAt), ipSends: ipRows.map((r) => r.createdAt) },
    now,
    limits,
  );
  if (!decision.ok) return decision;

  const code = generateOtpCode(input.rand);
  const existing = await db.user.findUnique({
    where: { email: input.email },
    select: { id: true },
  });
  await db.otpChallenge.create({
    data: {
      email: input.email,
      codeHash: codeHash(input.email, code),
      purpose: existing ? "SIGN_IN" : "SIGN_UP",
      expiresAt: new Date(now.getTime() + limits.ttlMs),
      ipHash,
      createdAt: now,
    },
  });
  await (input.mailer ?? getEmailProvider()).send(input.email, input.subject, input.message(code));
  return { ok: true };
}

export type VerifyResult =
  { ok: true; userId: string; isNew: boolean } | Exclude<VerifyDecision, { ok: true }>;

/** Check a code against the latest challenge for the email; creates the user on first sign-up. */
export async function verifyOtp(input: {
  email: string;
  code: string;
  now?: Date;
  db?: PrismaClient;
}): Promise<VerifyResult> {
  const db = input.db ?? getDb();
  const now = input.now ?? new Date();
  const challenge = await db.otpChallenge.findFirst({
    where: { email: input.email },
    orderBy: { createdAt: "desc" },
  });
  const matches =
    !!challenge &&
    /^\d{6}$/.test(input.code) &&
    safeEqualHex(challenge.codeHash, codeHash(input.email, input.code));
  const decision = evaluateVerify(challenge, matches, now);

  if (!decision.ok) {
    if (
      challenge &&
      (decision.code === "WRONG_CODE" || decision.code === "TOO_MANY_ATTEMPTS") &&
      !matches
    ) {
      await db.otpChallenge.update({
        where: { id: challenge.id },
        data: { attempts: { increment: 1 } },
      });
    }
    return decision;
  }

  // Consume atomically so a code can only be used once even under concurrent requests.
  const consumed = await db.otpChallenge.updateMany({
    where: { id: challenge!.id, consumedAt: null },
    data: { consumedAt: now, attempts: { increment: 1 } },
  });
  if (consumed.count === 0) return { ok: false, code: "NO_CHALLENGE" };

  const existing = await db.user.findUnique({ where: { email: input.email } });
  if (existing) {
    if (existing.status !== "ACTIVE" || existing.deletedAt)
      return { ok: false, code: "NO_CHALLENGE" };
    return { ok: true, userId: existing.id, isNew: false };
  }
  const user = await db.user.create({ data: { email: input.email } });
  return { ok: true, userId: user.id, isNew: true };
}
