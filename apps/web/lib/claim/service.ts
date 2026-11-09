import { getDb, type PrismaClient } from "@sgela/db";
import { normaliseClaimCode } from "@sgela/contracts";
import { emitSignals, vrSignalTypes } from "@/lib/interest/signals";

export const CLAIM_COOKIE = "sgela_claim";

export interface ClaimPreview {
  code: string;
  worlds: { worldCode: string; score: number; completed: boolean }[];
  expiresAt: string;
  claimed: boolean;
  claimedByViewer: boolean;
}

export type PreviewResult =
  | { ok: true; preview: ClaimPreview }
  | { ok: false; code: "INVALID_CODE" | "CLAIM_NOT_FOUND" | "CLAIM_EXPIRED" };

/** Public preview (L-ON-1, PRD 12.2): worlds and scores only, never PII. */
export async function previewClaim(
  rawCode: string,
  viewerLearnerId: string | null,
  now = new Date(),
  db: PrismaClient = getDb(),
): Promise<PreviewResult> {
  const code = normaliseClaimCode(rawCode);
  if (!code) return { ok: false, code: "INVALID_CODE" };
  const session = await db.expoSession.findUnique({
    where: { claimCode: code },
    include: { results: { orderBy: { score: "desc" } } },
  });
  if (!session) return { ok: false, code: "CLAIM_NOT_FOUND" };
  const claimedByViewer = !!viewerLearnerId && session.claimedByLearnerId === viewerLearnerId;
  if (session.claimExpiresAt <= now && !claimedByViewer)
    return { ok: false, code: "CLAIM_EXPIRED" };
  return {
    ok: true,
    preview: {
      code,
      worlds: session.results.map((r) => ({
        worldCode: r.worldCode,
        score: r.score,
        completed: r.completed,
      })),
      expiresAt: session.claimExpiresAt.toISOString(),
      claimed: !!session.claimedByLearnerId,
      claimedByViewer,
    },
  };
}

export type ClaimResult =
  | { ok: true; sessionId: string; worlds: string[]; alreadyLinked: boolean }
  | { ok: false; code: "INVALID_CODE" | "CLAIM_NOT_FOUND" | "CLAIM_EXPIRED" | "ALREADY_CLAIMED" };

/**
 * Link an expo session and all its results to a learner (L-ON-7). The conditional update makes
 * double claims impossible even when two people submit at the same moment (L-ON-1).
 */
export async function claimSession(
  rawCode: string,
  learnerId: string,
  now = new Date(),
  db: PrismaClient = getDb(),
): Promise<ClaimResult> {
  const code = normaliseClaimCode(rawCode);
  if (!code) return { ok: false, code: "INVALID_CODE" };
  const session = await db.expoSession.findUnique({
    where: { claimCode: code },
    include: { results: true },
  });
  if (!session) return { ok: false, code: "CLAIM_NOT_FOUND" };
  const worlds = session.results.map((r) => r.worldCode);
  if (session.claimedByLearnerId === learnerId) {
    return { ok: true, sessionId: session.id, worlds, alreadyLinked: true };
  }
  if (session.claimedByLearnerId) return { ok: false, code: "ALREADY_CLAIMED" };
  if (session.claimExpiresAt <= now) return { ok: false, code: "CLAIM_EXPIRED" };

  const learner = await db.learner.findUniqueOrThrow({
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

  const linked = await db.$transaction(async (tx) => {
    const { count } = await tx.expoSession.updateMany({
      where: { id: session.id, claimedByLearnerId: null },
      data: { claimedByLearnerId: learnerId, claimedAt: now },
    });
    if (count === 0) return false;
    await tx.vRSessionResult.updateMany({
      where: { expoSessionId: session.id },
      data: { learnerId },
    });
    // Initial interest signals from worlds played (L-ON-7, M2-5). Anonymised: bands plus a
    // salted one-way hash, never a learner id.
    await emitSignals(
      tx,
      { ...learner, schoolQuintile: learner.school?.quintile ?? null },
      session.results.flatMap((r) =>
        vrSignalTypes(r.score).map((type) => ({
          type,
          industryCode: r.worldCode,
          source: r.simulated ? ("EXPO_SIMULATED" as const) : ("EXPO" as const),
          expoEventId: session.expoEventId,
        })),
      ),
      now,
    );
    return true;
  });
  if (!linked) return { ok: false, code: "ALREADY_CLAIMED" };
  return { ok: true, sessionId: session.id, worlds, alreadyLinked: false };
}

/** Expo results already linked to a learner, newest first (Me page, done page). */
export async function linkedResults(learnerId: string, db: PrismaClient = getDb()) {
  return db.vRSessionResult.findMany({
    where: { learnerId },
    orderBy: { recordedAt: "desc" },
    select: { id: true, worldCode: true, score: true, recordedAt: true, simulated: true },
  });
}
