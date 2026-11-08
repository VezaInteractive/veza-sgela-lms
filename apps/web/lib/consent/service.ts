import { getDb, type LangCode, type PrismaClient } from "@sgela/db";
import {
  computeRestricted,
  resolveConsents,
  type ConsentActor,
  type ConsentScope,
  type ConsentState,
} from "@sgela/matching";
import { hashIp } from "@/lib/crypto";
import { isMinor } from "@/lib/onboarding/steps";

/** Version of the consent wording shown to learners and guardians (messages `consent.*`). */
export const CONSENT_TEXT_VERSION = "2026-11-v1";

/** Scopes offered at onboarding (L-ON-5/6). */
export const ONBOARDING_SCOPES = [
  "PLATFORM",
  "MATCHING",
  "PARTNER_CONTACT",
] as const satisfies readonly ConsentScope[];

export function toLangCode(locale: string): LangCode {
  const map: Record<string, LangCode> = {
    en: "EN",
    zu: "ZU",
    st: "ST",
    tn: "TN",
    xh: "XH",
    af: "AF",
  };
  return map[locale] ?? "EN";
}

export async function loadConsentState(
  learner: { id: string; dateOfBirth: Date },
  db: PrismaClient = getDb(),
  now = new Date(),
): Promise<ConsentState> {
  const rows = await db.consent.findMany({
    where: { learnerId: learner.id },
    orderBy: { createdAt: "asc" },
    select: { scope: true, granted: true, grantedBy: true, createdAt: true },
  });
  return resolveConsents(rows, { isMinor: isMinor(learner.dateOfBirth, now) });
}

export class ConsentError extends Error {
  constructor(public code: "MINOR_CANNOT_GRANT") {
    super(code);
  }
}

/**
 * Append consent rows (never update) and recompute restricted mode in one transaction.
 * Minors may withdraw a scope themselves but only a guardian can grant one.
 */
export async function recordConsents(input: {
  learnerId: string;
  choices: Partial<Record<ConsentScope, boolean>>;
  actor: ConsentActor;
  locale: string;
  ip?: string | null;
  now?: Date;
  db?: PrismaClient;
}): Promise<{ state: ConsentState; restricted: boolean }> {
  const db = input.db ?? getDb();
  const now = input.now ?? new Date();
  const learner = await db.learner.findUniqueOrThrow({
    where: { id: input.learnerId },
    select: { id: true, dateOfBirth: true },
  });
  const minor = isMinor(learner.dateOfBirth, now);
  const entries = Object.entries(input.choices) as [ConsentScope, boolean][];
  if (minor && input.actor === "LEARNER" && entries.some(([, granted]) => granted)) {
    throw new ConsentError("MINOR_CANNOT_GRANT");
  }
  const ipHash = input.ip ? hashIp(input.ip) : null;

  return db.$transaction(async (tx) => {
    if (entries.length > 0) {
      await tx.consent.createMany({
        data: entries.map(([scope, granted]) => ({
          learnerId: learner.id,
          scope,
          granted,
          grantedBy: input.actor,
          textVersion: CONSENT_TEXT_VERSION,
          language: toLangCode(input.locale),
          ipHash,
          createdAt: now,
        })),
      });
    }
    const rows = await tx.consent.findMany({
      where: { learnerId: learner.id },
      orderBy: { createdAt: "asc" },
      select: { scope: true, granted: true, grantedBy: true, createdAt: true },
    });
    const state = resolveConsents(rows, { isMinor: minor });
    const restricted = computeRestricted(state);
    await tx.learner.update({ where: { id: learner.id }, data: { restricted } });
    return { state, restricted };
  });
}
