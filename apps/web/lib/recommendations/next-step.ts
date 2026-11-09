/**
 * "Next best step" rules (PRD 7.11, M2-3). Deterministic: rules are evaluated in order and the
 * first match wins. Pure, so every rule and its precedence is unit tested; the DB loader lives
 * in ./context.ts. Restricted learners never get invite or opportunity steps.
 */
export const GUARDIAN_NUDGE_MS = 48 * 60 * 60_000;
export const INVITE_SOON_MS = 7 * 24 * 60 * 60_000;
export const MIN_EXPLORED_WORLDS = 3;

export interface NextStepContext {
  now: Date;
  restricted: boolean;
  /** The guardian request, or null when none was made. */
  guardian: { requestedAt: Date; responded: boolean } | null;
  invites: { partner: string; expiresAt: Date }[];
  inProgressSection: { title: string; href: string } | null;
  topicAwaitingCheck: { title: string; href: string } | null;
  /** All worlds in display order with the learner's interest score (0-100). */
  worlds: { code: string; interest: number }[];
  /** A published course per world the learner could start, and whether one was started there. */
  worldCourses: Record<string, { title: string; href: string; started: boolean } | undefined>;
  readinessGap: { item: string; opportunity: string; href: string } | null;
  explored: Set<string>;
}

export type NextStep =
  | { rule: 1; kind: "remindGuardian"; href: string }
  | { rule: 2; kind: "respondInvite"; href: string; partner: string }
  | { rule: 3; kind: "continueSection"; href: string; section: string }
  | { rule: 4; kind: "takeCheck"; href: string; topic: string }
  | { rule: 5; kind: "startCourse"; href: string; course: string }
  | { rule: 6; kind: "closeGap"; href: string; item: string; opportunity: string }
  | { rule: 7; kind: "exploreWorld"; href: string; world: string }
  | { rule: 8; kind: "askCoach"; href: string };

/** Worlds ordered by interest (high first), ties by display order. */
function byInterest<T extends { code: string; interest: number }>(worlds: T[]) {
  return worlds.map((w, i) => ({ ...w, i })).sort((a, b) => b.interest - a.interest || a.i - b.i);
}

export function nextBestStep(ctx: NextStepContext): NextStep {
  const now = ctx.now.getTime();

  // 1. Restricted mode and guardian consent pending for more than 48 h.
  if (
    ctx.restricted &&
    ctx.guardian &&
    !ctx.guardian.responded &&
    now - ctx.guardian.requestedAt.getTime() > GUARDIAN_NUDGE_MS
  ) {
    return { rule: 1, kind: "remindGuardian", href: "/start/guardian" };
  }

  // 2. Pending invite with a deadline within 7 days (never for restricted learners).
  if (!ctx.restricted) {
    const soon = ctx.invites
      .filter((i) => i.expiresAt.getTime() > now && i.expiresAt.getTime() - now <= INVITE_SOON_MS)
      .sort((a, b) => a.expiresAt.getTime() - b.expiresAt.getTime())[0];
    if (soon) {
      return { rule: 2, kind: "respondInvite", href: "/opportunities", partner: soon.partner };
    }
  }

  // 3. A section in progress.
  if (ctx.inProgressSection) {
    const s = ctx.inProgressSection;
    return { rule: 3, kind: "continueSection", href: s.href, section: s.title };
  }

  // 4. Topic complete but its check not attempted.
  if (ctx.topicAwaitingCheck) {
    const t = ctx.topicAwaitingCheck;
    return { rule: 4, kind: "takeCheck", href: t.href, topic: t.title };
  }

  // 5. Highest-interest world with no course started.
  const top = byInterest(ctx.worlds).filter((w) => w.interest > 0)[0];
  const course = top ? ctx.worldCourses[top.code] : undefined;
  if (course && !course.started) {
    return { rule: 5, kind: "startCourse", href: course.href, course: course.title };
  }

  // 6. Readiness gap on a top match (never for restricted learners).
  if (!ctx.restricted && ctx.readinessGap) {
    return { rule: 6, kind: "closeGap", ...ctx.readinessGap };
  }

  // 7. Fewer than 3 worlds explored: the unexplored world with the most interest, then by order.
  if (ctx.explored.size < MIN_EXPLORED_WORLDS) {
    const next = byInterest(ctx.worlds).filter((w) => !ctx.explored.has(w.code))[0];
    if (next) {
      return {
        rule: 7,
        kind: "exploreWorld",
        href: "/explore/" + next.code.toLowerCase(),
        world: next.code,
      };
    }
  }

  // 8. Default. The coach arrives in M6; until then this opens Help.
  return { rule: 8, kind: "askCoach", href: "/help" };
}
