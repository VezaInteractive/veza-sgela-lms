import { describe, expect, it } from "vitest";
import { nextBestStep, type NextStepContext } from "./next-step";

const NOW = new Date("2026-11-10T10:00:00Z");
const HOUR = 60 * 60_000;
const DAY = 24 * HOUR;
const WORLDS = ["AVI", "ENG", "CUL", "MED", "AGR"];

/** A learner with nothing pending and every world explored: only the default rule matches. */
function base(over: Partial<NextStepContext> = {}): NextStepContext {
  return {
    now: NOW,
    restricted: false,
    guardian: null,
    invites: [],
    inProgressSection: null,
    topicAwaitingCheck: null,
    worlds: WORLDS.map((code) => ({ code, interest: 0 })),
    worldCourses: {},
    readinessGap: null,
    explored: new Set(WORLDS),
    ...over,
  };
}

/** Context fragments that make exactly one rule match. */
const RULE: Record<number, Partial<NextStepContext>> = {
  1: {
    restricted: true,
    guardian: { requestedAt: new Date(NOW.getTime() - 49 * HOUR), responded: false },
  },
  2: {
    invites: [{ partner: "Skylark Aviation Trust", expiresAt: new Date(NOW.getTime() + 3 * DAY) }],
  },
  3: { inProgressSection: { title: "Testing soil pH", href: "/learn/agr-101" } },
  4: { topicAwaitingCheck: { title: "Soil health", href: "/learn/agr-101" } },
  5: {
    worlds: WORLDS.map((code) => ({ code, interest: code === "AGR" ? 60 : 10 })),
    worldCourses: { AGR: { title: "AGR-101", href: "/learn/agr-101", started: false } },
  },
  6: {
    readinessGap: { item: "Topic 2", opportunity: "Farm learnership", href: "/opportunities" },
  },
  7: { explored: new Set(["AVI"]) },
};

function merge(...parts: Partial<NextStepContext>[]): NextStepContext {
  return base(Object.assign({}, ...parts));
}

describe("next best step (PRD 7.11)", () => {
  it("falls back to asking the coach (rule 8)", () => {
    expect(nextBestStep(base())).toMatchObject({ rule: 8, kind: "askCoach" });
  });

  it.each([1, 2, 3, 4, 5, 6, 7])("rule %i matches on its own", (rule) => {
    expect(nextBestStep(merge(RULE[rule]!)).rule).toBe(rule);
  });

  it.each([1, 2, 3, 4, 5, 6, 7])("rule %i wins over every later rule", (rule) => {
    const later = [2, 3, 4, 5, 6, 7].filter((r) => r > rule).map((r) => RULE[r]!);
    // This rule's fragment goes last so a later fragment cannot overwrite a field it needs.
    expect(nextBestStep(merge(...later, RULE[rule]!)).rule).toBe(rule);
  });

  it("rule 1 sends the learner to resend the guardian link", () => {
    const ctx = merge(RULE[3]!, RULE[4]!, RULE[5]!, RULE[7]!, RULE[1]!);
    expect(nextBestStep(ctx)).toMatchObject({ rule: 1, href: "/start/guardian" });
  });

  it("rule 1 waits 48 hours and stops once the guardian answered", () => {
    const fresh = { requestedAt: new Date(NOW.getTime() - 47 * HOUR), responded: false };
    expect(nextBestStep(merge({ restricted: true, guardian: fresh })).rule).toBe(8);
    const answered = { requestedAt: new Date(NOW.getTime() - 72 * HOUR), responded: true };
    expect(nextBestStep(merge({ restricted: true, guardian: answered })).rule).toBe(8);
    const notRestricted = { requestedAt: new Date(NOW.getTime() - 72 * HOUR), responded: false };
    expect(nextBestStep(merge({ restricted: false, guardian: notRestricted })).rule).toBe(8);
  });

  it("restricted learners never get invite or opportunity steps (rules 2 and 6)", () => {
    expect(nextBestStep(merge(RULE[2]!, { restricted: true })).rule).toBe(8);
    expect(nextBestStep(merge(RULE[6]!, { restricted: true })).rule).toBe(8);
  });

  it("rule 2 ignores closed and later invites, and picks the soonest", () => {
    const later = { partner: "Late", expiresAt: new Date(NOW.getTime() + 8 * DAY) };
    const closed = { partner: "Closed", expiresAt: new Date(NOW.getTime() - HOUR) };
    expect(nextBestStep(merge({ invites: [later, closed] })).rule).toBe(8);
    const a = { partner: "A", expiresAt: new Date(NOW.getTime() + 5 * DAY) };
    const b = { partner: "B", expiresAt: new Date(NOW.getTime() + 2 * DAY) };
    expect(nextBestStep(merge({ invites: [a, b] }))).toMatchObject({ rule: 2, partner: "B" });
  });

  it("rule 5 only looks at the highest-interest world, and only before a course is started", () => {
    const otherTop = merge({
      worlds: WORLDS.map((code) => ({ code, interest: code === "AVI" ? 80 : 20 })),
      worldCourses: { AGR: { title: "AGR-101", href: "/learn/agr-101", started: false } },
    });
    expect(nextBestStep(otherTop).rule).toBe(8);
    const started = merge(RULE[5]!, {
      worldCourses: { AGR: { title: "AGR-101", href: "/learn/agr-101", started: true } },
    });
    expect(nextBestStep(started).rule).toBe(8);
  });

  it("rule 5 needs some interest first", () => {
    const ctx = merge({
      worldCourses: { AVI: { title: "AVI-101", href: "/learn/avi-101", started: false } },
    });
    expect(nextBestStep(ctx).rule).toBe(8);
  });

  it("rule 7 suggests the unexplored world with most interest, then by display order", () => {
    const tied = merge({ explored: new Set(["AVI"]) });
    expect(nextBestStep(tied)).toMatchObject({ rule: 7, world: "ENG", href: "/explore/eng" });
    const keen = merge({
      explored: new Set(["AVI", "ENG"]),
      worlds: WORLDS.map((code) => ({ code, interest: code === "MED" ? 30 : 0 })),
    });
    expect(nextBestStep(keen)).toMatchObject({ rule: 7, world: "MED" });
  });

  it("rule 7 stops at three explored worlds", () => {
    expect(nextBestStep(merge({ explored: new Set(["AVI", "ENG", "CUL"]) })).rule).toBe(8);
  });
});
