import { getDb, type LearnerInterestKind, type PrismaClient } from "@sgela/db";
import { exploredWorlds, interestScores, type InterestInputs } from "./score";
import { emitSignals, type SignalInput, type SignalLearner } from "./signals";

/**
 * Learner interest records (M2-5, D-034): "I'm interested" toggles (L-EX-4) and pages opened.
 * Every call is scoped to the signed-in learner's own id by the caller (server actions and
 * pages); nothing here lists another learner's interests.
 */

async function signalLearner(learnerId: string, db: PrismaClient): Promise<SignalLearner> {
  const l = await db.learner.findUniqueOrThrow({
    where: { id: learnerId },
    select: {
      id: true,
      dateOfBirth: true,
      provinceCode: true,
      districtCode: true,
      grade: true,
      school: { select: { quintile: true } },
    },
  });
  return { ...l, schoolQuintile: l.school?.quintile ?? null };
}

export async function loadInterestInputs(
  learnerId: string,
  db: PrismaClient = getDb(),
): Promise<InterestInputs> {
  const [vr, interests] = await Promise.all([
    db.vRSessionResult.findMany({
      where: { learnerId },
      select: { worldCode: true, score: true },
    }),
    db.learnerInterest.findMany({
      where: { learnerId },
      select: { kind: true, industryCode: true },
    }),
  ]);
  return { vr, interests };
}

/** Interest score per world (0-100) plus the set of explored worlds. */
export async function loadInterestSummary(
  learnerId: string,
  worldCodes: string[],
  db: PrismaClient = getDb(),
) {
  const inputs = await loadInterestInputs(learnerId, db);
  return { scores: interestScores(worldCodes, inputs), explored: exploredWorlds(inputs) };
}

/** Which worlds and careers the learner marked "I'm interested" (by target key). */
export async function loadToggles(learnerId: string, db: PrismaClient = getDb()) {
  const rows = await db.learnerInterest.findMany({
    where: { learnerId, kind: { in: ["WORLD_TOGGLE", "CAREER_TOGGLE"] } },
    select: { targetKey: true },
  });
  return new Set(rows.map((r) => r.targetKey));
}

/**
 * Record that the learner opened a world or career page. One personal record per target;
 * opening a career also emits a CAREER_VIEW signal (de-duplicated per 24 h).
 */
export async function recordView(
  learnerId: string,
  target: { industryCode: string; careerId?: string; sponsorOrgId?: string | null },
  now = new Date(),
  db: PrismaClient = getDb(),
): Promise<void> {
  const kind: LearnerInterestKind = target.careerId ? "CAREER_VIEW" : "WORLD_VIEW";
  await db.learnerInterest.createMany({
    data: [
      {
        learnerId,
        kind,
        industryCode: target.industryCode,
        careerId: target.careerId ?? null,
        targetKey: target.careerId ?? target.industryCode,
      },
    ],
    skipDuplicates: true,
  });
  if (target.careerId) {
    const signal: SignalInput = {
      type: "CAREER_VIEW",
      industryCode: target.industryCode,
      careerId: target.careerId,
      sponsorOrgId: target.sponsorOrgId ?? null,
    };
    await emitSignals(db, await signalLearner(learnerId, db), [signal], now);
  }
}

/**
 * Turn "I'm interested" on or off for a world or a career (L-EX-4). Turning it on strengthens
 * the interest score and emits an anonymised signal; signals are append-only, so turning it
 * off only removes the learner's own record.
 */
export async function setInterest(
  learnerId: string,
  target: { industryCode: string; careerId?: string; on: boolean; sponsorOrgId?: string | null },
  now = new Date(),
  db: PrismaClient = getDb(),
): Promise<{ on: boolean; signals: number }> {
  const kind: LearnerInterestKind = target.careerId ? "CAREER_TOGGLE" : "WORLD_TOGGLE";
  const targetKey = target.careerId ?? target.industryCode;
  if (!target.on) {
    await db.learnerInterest.deleteMany({ where: { learnerId, kind, targetKey } });
    return { on: false, signals: 0 };
  }
  const { count } = await db.learnerInterest.createMany({
    data: [
      {
        learnerId,
        kind,
        industryCode: target.industryCode,
        careerId: target.careerId ?? null,
        targetKey,
      },
    ],
    skipDuplicates: true,
  });
  if (count === 0) return { on: true, signals: 0 };
  const signal: SignalInput = {
    type: target.careerId ? "CAREER_INTEREST_TOGGLE" : "WORLD_INTEREST_TOGGLE",
    industryCode: target.industryCode,
    careerId: target.careerId ?? null,
    sponsorOrgId: target.sponsorOrgId ?? null,
  };
  const signals = await emitSignals(db, await signalLearner(learnerId, db), [signal], now);
  return { on: true, signals };
}
