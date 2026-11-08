import { getDb, type PrismaClient } from "@sgela/db";
import { isMatchable, resolveConsents } from "@sgela/matching";
import { isMinor } from "@/lib/onboarding/steps";

/**
 * Learners the matching engine (M5) may consider. Restricted learners are excluded in the
 * query itself and again by the pure gate, so a bug in one layer cannot leak a minor.
 */
export async function findMatchableLearnerIds(
  opts: { learnerIds?: string[]; now?: Date } = {},
  db: PrismaClient = getDb(),
): Promise<string[]> {
  const now = opts.now ?? new Date();
  const rows = await db.learner.findMany({
    where: {
      restricted: false,
      deletedAt: null,
      user: { status: "ACTIVE", deletedAt: null },
      ...(opts.learnerIds ? { id: { in: opts.learnerIds } } : {}),
    },
    select: {
      id: true,
      restricted: true,
      deletedAt: true,
      dateOfBirth: true,
      consents: { select: { scope: true, granted: true, grantedBy: true, createdAt: true } },
    },
  });
  return rows
    .filter((l) =>
      isMatchable({
        restricted: l.restricted,
        deletedAt: l.deletedAt,
        consents: resolveConsents(l.consents, { isMinor: isMinor(l.dateOfBirth, now) }),
      }),
    )
    .map((l) => l.id);
}
