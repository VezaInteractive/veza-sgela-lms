import { getDb, type PrismaClient } from "@sgela/db";
import { getSmsProvider, type SmsProvider } from "@sgela/messaging";
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

const codeHash = (phoneE164: string, code: string) => hmac("otp:" + phoneE164 + ":" + code);

export interface RequestOtpInput {
  phoneE164: string;
  ip: string | null;
  /** Localised SMS body; receives the code. */
  message: (code: string) => string;
  now?: Date;
  db?: PrismaClient;
  sms?: SmsProvider;
  rand?: (max: number) => number;
}

/** Send a 6-digit code (L-ON-2). Rate limits are counted from OtpChallenge rows. */
export async function requestOtp(input: RequestOtpInput): Promise<SendDecision> {
  const db = input.db ?? getDb();
  const now = input.now ?? new Date();
  const limits = otpLimits();
  const ipHash = hashIp(input.ip);
  const since = new Date(now.getTime() - HOUR_MS);

  const [phoneRows, ipRows] = await Promise.all([
    db.otpChallenge.findMany({
      where: { phoneE164: input.phoneE164, createdAt: { gt: since } },
      select: { createdAt: true },
    }),
    db.otpChallenge.findMany({
      where: { ipHash, createdAt: { gt: since } },
      select: { createdAt: true },
    }),
  ]);
  const decision = checkSendAllowed(
    { phoneSends: phoneRows.map((r) => r.createdAt), ipSends: ipRows.map((r) => r.createdAt) },
    now,
    limits,
  );
  if (!decision.ok) return decision;

  const code = generateOtpCode(input.rand);
  const existing = await db.user.findUnique({
    where: { phoneE164: input.phoneE164 },
    select: { id: true },
  });
  await db.otpChallenge.create({
    data: {
      phoneE164: input.phoneE164,
      codeHash: codeHash(input.phoneE164, code),
      purpose: existing ? "SIGN_IN" : "SIGN_UP",
      expiresAt: new Date(now.getTime() + limits.ttlMs),
      ipHash,
      createdAt: now,
    },
  });
  await (input.sms ?? getSmsProvider()).send(input.phoneE164, input.message(code));
  return { ok: true };
}

export type VerifyResult =
  { ok: true; userId: string; isNew: boolean } | Exclude<VerifyDecision, { ok: true }>;

/** Check a code against the latest challenge for the number; creates the user on first sign-up. */
export async function verifyOtp(input: {
  phoneE164: string;
  code: string;
  now?: Date;
  db?: PrismaClient;
}): Promise<VerifyResult> {
  const db = input.db ?? getDb();
  const now = input.now ?? new Date();
  const challenge = await db.otpChallenge.findFirst({
    where: { phoneE164: input.phoneE164 },
    orderBy: { createdAt: "desc" },
  });
  const matches =
    !!challenge &&
    /^\d{6}$/.test(input.code) &&
    safeEqualHex(challenge.codeHash, codeHash(input.phoneE164, input.code));
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

  const existing = await db.user.findUnique({ where: { phoneE164: input.phoneE164 } });
  if (existing) {
    if (existing.status !== "ACTIVE" || existing.deletedAt)
      return { ok: false, code: "NO_CHALLENGE" };
    return { ok: true, userId: existing.id, isNew: false };
  }
  const user = await db.user.create({ data: { phoneE164: input.phoneE164 } });
  return { ok: true, userId: user.id, isNew: true };
}
