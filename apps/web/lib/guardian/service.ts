import { createHmac } from "node:crypto";
import { getDb, type PrismaClient } from "@sgela/db";
import {
  getSmsProvider,
  getWhatsAppProvider,
  type SmsProvider,
  type WhatsAppProvider,
} from "@sgela/messaging";
import { recordConsents } from "@/lib/consent/service";
import { sha256 } from "@/lib/crypto";
import { appUrl } from "@/lib/http";
import { localeFromLang, smsTranslator } from "./messages";

export const GUARDIAN_LINK_TTL_MS = 30 * 24 * 60 * 60_000;
export const REMINDER_OFFSETS_MS = [48 * 60 * 60_000, 7 * 24 * 60 * 60_000] as const;

function authSecret() {
  return process.env.AUTH_SECRET && process.env.AUTH_SECRET.length >= 8
    ? process.env.AUTH_SECRET
    : "dev-only-AUTH_SECRET";
}

/**
 * The consent link token is derived (HMAC of learner + request time) so reminders can resend the
 * same link without storing it; the DB keeps only sha256(token). Re-inviting changes requestedAt
 * and so invalidates older links.
 */
export function guardianToken(learnerId: string, requestedAt: Date): string {
  return createHmac("sha256", authSecret())
    .update("guardian:" + learnerId + ":" + requestedAt.toISOString())
    .digest("base64url");
}

export function consentLink(token: string): string {
  return appUrl() + "/consent/" + token;
}

interface Senders {
  sms?: SmsProvider;
  whatsapp?: WhatsAppProvider;
}

async function sendLink(
  to: string,
  kind: "guardianInvite" | "guardianReminder",
  params: { learner: string; guardian: string; link: string },
  locale: string,
  senders: Senders,
) {
  const t = smsTranslator(locale);
  await (senders.sms ?? getSmsProvider()).send(to, t(kind, params));
  // WhatsApp when available (L-ON-4); console provider in dev.
  await (senders.whatsapp ?? getWhatsAppProvider()).sendTemplate(
    to,
    kind === "guardianInvite" ? "guardian_consent" : "guardian_reminder",
    params,
  );
}

/** Create or replace the guardian and send the consent link (L-ON-4). */
export async function inviteGuardian(input: {
  learnerId: string;
  name: string;
  phoneE164: string;
  relationship?: string | null;
  now?: Date;
  db?: PrismaClient;
  senders?: Senders;
}) {
  const db = input.db ?? getDb();
  const now = input.now ?? new Date();
  const learner = await db.learner.findUniqueOrThrow({
    where: { id: input.learnerId },
    select: { id: true, firstName: true, language: true },
  });
  const token = guardianToken(learner.id, now);
  const data = {
    name: input.name,
    phoneE164: input.phoneE164,
    relationship: input.relationship ?? null,
    consentToken: sha256(token),
    tokenExpiresAt: new Date(now.getTime() + GUARDIAN_LINK_TTL_MS),
    requestedAt: now,
    remindersSent: 0,
    lastReminderAt: null,
    respondedAt: null,
  };
  const guardian = await db.guardian.upsert({
    where: { learnerId: learner.id },
    create: { learnerId: learner.id, ...data },
    update: data,
  });
  await sendLink(
    input.phoneE164,
    "guardianInvite",
    { learner: learner.firstName, guardian: input.name, link: consentLink(token) },
    localeFromLang(learner.language),
    input.senders ?? {},
  );
  return { guardian, token };
}

export async function findGuardianByToken(
  token: string,
  now = new Date(),
  db: PrismaClient = getDb(),
) {
  if (!/^[A-Za-z0-9_-]{20,100}$/.test(token)) return null;
  const guardian = await db.guardian.findUnique({
    where: { consentToken: sha256(token) },
    include: {
      learner: { select: { id: true, firstName: true, language: true, restricted: true } },
    },
  });
  if (!guardian || guardian.tokenExpiresAt <= now) return null;
  return guardian;
}

export type GuardianChoices = { PLATFORM: boolean; MATCHING: boolean; PARTNER_CONTACT: boolean };

/** Guardian grants or declines (L-ON-5). Declining records all scopes as not granted. */
export async function respondAsGuardian(input: {
  token: string;
  agree: boolean;
  choices: GuardianChoices;
  locale: string;
  ip?: string | null;
  now?: Date;
  db?: PrismaClient;
}) {
  const db = input.db ?? getDb();
  const now = input.now ?? new Date();
  const guardian = await findGuardianByToken(input.token, now, db);
  if (!guardian) return { ok: false as const, code: "INVALID_TOKEN" as const };
  const choices: GuardianChoices = input.agree
    ? { ...input.choices, PLATFORM: true }
    : { PLATFORM: false, MATCHING: false, PARTNER_CONTACT: false };
  const result = await recordConsents({
    learnerId: guardian.learnerId,
    choices,
    actor: "GUARDIAN",
    locale: input.locale,
    ip: input.ip,
    now,
    db,
  });
  await db.guardian.update({ where: { id: guardian.id }, data: { respondedAt: now } });
  return { ok: true as const, restricted: result.restricted, learnerId: guardian.learnerId };
}

export interface ReminderCandidate {
  requestedAt: Date;
  remindersSent: number;
  respondedAt: Date | null;
  tokenExpiresAt: Date;
  learner: { restricted: boolean };
}

/** Which reminder (1 = 48 h, 2 = 7 d) is due now, if any. Pure; tested with a fake clock. */
export function dueReminder(g: ReminderCandidate, now: Date): 1 | 2 | null {
  if (g.respondedAt || !g.learner.restricted || g.tokenExpiresAt <= now) return null;
  const elapsed = now.getTime() - g.requestedAt.getTime();
  if (g.remindersSent === 0 && elapsed >= REMINDER_OFFSETS_MS[0]) {
    // A run that was down for days sends only the latest due reminder.
    return elapsed >= REMINDER_OFFSETS_MS[1] ? 2 : 1;
  }
  if (g.remindersSent === 1 && elapsed >= REMINDER_OFFSETS_MS[1]) return 2;
  return null;
}

/** `guardian.reminders` job (PRD 13.4): idempotent, safe to run every few minutes. */
export async function runGuardianReminders(
  input: { now?: Date; db?: PrismaClient; senders?: Senders } = {},
) {
  const db = input.db ?? getDb();
  const now = input.now ?? new Date();
  const candidates = await db.guardian.findMany({
    where: {
      respondedAt: null,
      remindersSent: { lt: 2 },
      tokenExpiresAt: { gt: now },
      requestedAt: { lte: new Date(now.getTime() - REMINDER_OFFSETS_MS[0]) },
      learner: { restricted: true, deletedAt: null },
    },
    include: {
      learner: { select: { id: true, firstName: true, language: true, restricted: true } },
    },
  });
  let sent = 0;
  for (const g of candidates) {
    const due = dueReminder(g, now);
    if (!due) continue;
    // Claim the reminder first so concurrent runs never double-send.
    const claimed = await db.guardian.updateMany({
      where: { id: g.id, remindersSent: g.remindersSent },
      data: { remindersSent: due, lastReminderAt: now },
    });
    if (claimed.count === 0) continue;
    const token = guardianToken(g.learnerId, g.requestedAt);
    await sendLink(
      g.phoneE164,
      "guardianReminder",
      { learner: g.learner.firstName, guardian: g.name, link: consentLink(token) },
      localeFromLang(g.learner.language),
      input.senders ?? {},
    );
    sent += 1;
  }
  return { checked: candidates.length, sent };
}
