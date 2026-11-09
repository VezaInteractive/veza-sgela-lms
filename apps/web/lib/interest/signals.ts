import type { Prisma, PrismaClient } from "@sgela/db";
import { learnerSignalHash } from "@/lib/crypto";
import { ageOn } from "@/lib/onboarding/steps";

/**
 * Anonymised InterestSignal emitter (PRD 9.3, M2-5, D-034). Signals carry bands, never a
 * learner id: only a quarterly-salted one-way hash used to de-duplicate within 24 hours.
 */
export const SIGNAL_WEIGHTS = {
  VR_WORLD_PLAYED: 3,
  VR_HIGH_SCORE: 2,
  WORLD_INTEREST_TOGGLE: 2,
  CAREER_INTEREST_TOGGLE: 2,
  CAREER_VIEW: 1,
  COURSE_ENROL: 3,
  TOPIC_COMPLETE: 2,
  CREDENTIAL: 5,
  OPPORTUNITY_ACCEPT: 4,
} as const;

export type SignalType = keyof typeof SIGNAL_WEIGHTS;
export const SIGNAL_TYPES = Object.keys(SIGNAL_WEIGHTS) as SignalType[];

/** VR score at or above this also emits VR_HIGH_SCORE. */
export const HIGH_SCORE = 75;
export const DEDUPE_WINDOW_MS = 24 * 60 * 60_000;

export type SignalSource = "PLATFORM" | "EXPO" | "EXPO_SIMULATED";

export function ageBand(age: number): string {
  if (age < 15) return "<15";
  if (age < 18) return "15-17";
  if (age < 25) return "18-24";
  if (age < 36) return "25-35";
  return "36+";
}

export function gradeBand(grade: number | null | undefined): string | null {
  if (!grade) return null;
  return grade >= 10 ? "10-12" : "8-9";
}

/** Salt period: the calendar quarter in UTC, e.g. "2026Q4". */
export function quarterOf(now: Date): string {
  return now.getUTCFullYear() + "Q" + (Math.floor(now.getUTCMonth() / 3) + 1);
}

export interface SignalLearner {
  id: string;
  dateOfBirth: Date;
  provinceCode: string;
  districtCode: string;
  grade: number | null;
  schoolQuintile?: number | null;
}

export interface SignalInput {
  type: SignalType;
  industryCode: string;
  careerId?: string | null;
  source?: SignalSource;
  expoEventId?: string | null;
  sponsorOrgId?: string | null;
}

/** Pure: the row to insert. Contains bands and the salted hash only. */
export function buildSignal(
  learner: SignalLearner,
  input: SignalInput,
  now: Date,
): Prisma.InterestSignalCreateManyInput {
  return {
    learnerHash: learnerSignalHash(learner.id, quarterOf(now)),
    industryCode: input.industryCode,
    careerId: input.careerId ?? null,
    signalType: input.type,
    weight: SIGNAL_WEIGHTS[input.type],
    provinceCode: learner.provinceCode,
    districtCode: learner.districtCode,
    ageBand: ageBand(ageOn(learner.dateOfBirth, now)),
    gradeBand: gradeBand(learner.grade),
    schoolQuintile: learner.schoolQuintile ?? null,
    source: input.source ?? "PLATFORM",
    expoEventId: input.expoEventId ?? null,
    sponsorOrgId: input.sponsorOrgId ?? null,
    occurredAt: now,
  };
}

/** Signal types for one VR result (played, plus high score at or above 75). */
export function vrSignalTypes(score: number): SignalType[] {
  return score >= HIGH_SCORE ? ["VR_WORLD_PLAYED", "VR_HIGH_SCORE"] : ["VR_WORLD_PLAYED"];
}

interface Keyed {
  signalType: string;
  industryCode: string;
  careerId?: string | null;
}

const key = (s: Keyed) => s.signalType + "|" + s.industryCode + "|" + (s.careerId ?? "");

/** Pure: drop signals already sent (same hash, type, world, career) and in-batch duplicates. */
export function dedupeSignals<T extends Keyed>(rows: T[], recent: Keyed[]): T[] {
  const seen = new Set(recent.map(key));
  const out: T[] = [];
  for (const r of rows) {
    const k = key(r);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(r);
  }
  return out;
}

type SignalDb = Pick<PrismaClient, "interestSignal">;

/**
 * Write signals for one learner, skipping any already written in the last 24 h. Returns the
 * number written. Pass a transaction client when the signal belongs to a larger write.
 */
export async function emitSignals(
  db: SignalDb,
  learner: SignalLearner,
  inputs: SignalInput[],
  now: Date = new Date(),
): Promise<number> {
  if (inputs.length === 0) return 0;
  const rows = inputs.map((i) => buildSignal(learner, i, now));
  const recent = await db.interestSignal.findMany({
    where: {
      learnerHash: rows[0]!.learnerHash!,
      occurredAt: { gte: new Date(now.getTime() - DEDUPE_WINDOW_MS) },
      signalType: { in: [...new Set(rows.map((r) => r.signalType))] },
    },
    select: { signalType: true, industryCode: true, careerId: true },
  });
  const fresh = dedupeSignals(rows, recent);
  if (fresh.length) await db.interestSignal.createMany({ data: fresh });
  return fresh.length;
}
