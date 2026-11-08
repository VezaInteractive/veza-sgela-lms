import { getDb, type PrismaClient } from "@sgela/db";

/** Minimum group size before an aggregate is shown (CLAUDE.md, PRD 9.3). */
export const MIN_CELL = 20;

export interface Cell {
  key: string;
  value: number | null;
}

/** Never return a group smaller than MIN_CELL: its value becomes null (shown as hidden). */
export function suppress(rows: { key: string; count: number }[], min = MIN_CELL): Cell[] {
  return rows
    .map((r) => ({ key: r.key, value: r.count >= min ? r.count : null }))
    .sort((a, b) => (b.value ?? -1) - (a.value ?? -1));
}

export const FUNNEL_STEPS = [
  "expo_session",
  "claim_viewed",
  "claim_started",
  "account_created",
  "profile_completed",
  "claim_linked",
  "consent_complete",
] as const;

/** Aggregates only: no learner-level rows ever leave this function. */
export async function loadInsights(now = new Date(), db: PrismaClient = getDb()) {
  const adultCutoff = new Date(
    Date.UTC(now.getUTCFullYear() - 18, now.getUTCMonth(), now.getUTCDate()),
  );
  const active = { deletedAt: null };
  const [
    learners,
    minors,
    restricted,
    claimed,
    sessions,
    simulatedSessions,
    events,
    provinces,
    worlds,
  ] = await Promise.all([
    db.learner.count({ where: active }),
    db.learner.count({ where: { ...active, dateOfBirth: { gt: adultCutoff } } }),
    db.learner.count({ where: { ...active, restricted: true } }),
    db.expoSession.count({ where: { claimedByLearnerId: { not: null } } }),
    db.expoSession.count(),
    db.expoSession.count({ where: { results: { some: { simulated: true } } } }),
    db.event.groupBy({
      by: ["name"],
      where: { name: { in: [...FUNNEL_STEPS] } },
      _count: { _all: true },
    }),
    db.learner.groupBy({ by: ["provinceCode"], where: active, _count: { _all: true } }),
    db.interestSignal.groupBy({ by: ["industryCode"], _count: { _all: true } }),
  ]);
  const eventCount = new Map(events.map((e) => [e.name, e._count._all]));
  return {
    kpis: { learners, minors, restricted, claimed, sessions, simulatedSessions },
    funnel: FUNNEL_STEPS.map((step) => ({ step, count: eventCount.get(step) ?? 0 })),
    provinces: suppress(provinces.map((p) => ({ key: p.provinceCode, count: p._count._all }))),
    worlds: suppress(worlds.map((w) => ({ key: w.industryCode, count: w._count._all }))),
  };
}
