import { describe, expect, it } from "vitest";
import { computeRestricted, latestPerScope, resolveConsents, type ConsentRow } from "./consent";
import { isMatchable } from "./eligibility";

const t = (min: number) => new Date(Date.UTC(2026, 10, 20, 9, min));
const row = (
  scope: ConsentRow["scope"],
  granted: boolean,
  by: ConsentRow["grantedBy"],
  min: number,
): ConsentRow => ({
  scope,
  granted,
  grantedBy: by,
  createdAt: t(min),
});

describe("consent resolution", () => {
  it("latest row per scope wins regardless of input order", () => {
    const rows = [row("MATCHING", false, "LEARNER", 5), row("MATCHING", true, "LEARNER", 1)];
    expect(latestPerScope(rows).get("MATCHING")?.granted).toBe(false);
    const state = resolveConsents([...rows].reverse(), { isMinor: false });
    expect(state.MATCHING).toEqual({ granted: false, grantedBy: "LEARNER", at: t(5) });
  });

  it("withdraw then re-grant ends granted", () => {
    const rows = [
      row("MATCHING", true, "LEARNER", 1),
      row("MATCHING", false, "LEARNER", 2),
      row("MATCHING", true, "LEARNER", 3),
    ];
    expect(resolveConsents(rows, { isMinor: false }).MATCHING.granted).toBe(true);
  });

  it("missing scopes resolve to not granted", () => {
    const state = resolveConsents([], { isMinor: false });
    expect(state.PLATFORM).toEqual({ granted: false, grantedBy: null, at: null });
    expect(computeRestricted(state)).toBe(true);
  });

  it("ignores learner grants for minors but honours learner withdrawals", () => {
    const self = resolveConsents([row("PLATFORM", true, "LEARNER", 1)], { isMinor: true });
    expect(self.PLATFORM.granted).toBe(false);
    expect(computeRestricted(self)).toBe(true);

    const guardian = [row("PLATFORM", true, "GUARDIAN", 1), row("MATCHING", true, "GUARDIAN", 1)];
    expect(computeRestricted(resolveConsents(guardian, { isMinor: true }))).toBe(false);

    const withdrawn = [...guardian, row("MATCHING", false, "LEARNER", 2)];
    expect(resolveConsents(withdrawn, { isMinor: true }).MATCHING.granted).toBe(false);
  });
});

describe("restricted-mode exclusion", () => {
  const consents = resolveConsents(
    [row("PLATFORM", true, "GUARDIAN", 1), row("MATCHING", true, "GUARDIAN", 1)],
    { isMinor: true },
  );

  it("never matches restricted learners", () => {
    expect(isMatchable({ restricted: true, deletedAt: null, consents })).toBe(false);
  });

  it("needs platform and matching consent", () => {
    expect(isMatchable({ restricted: false, deletedAt: null, consents })).toBe(true);
    const noMatching = resolveConsents([row("PLATFORM", true, "LEARNER", 1)], { isMinor: false });
    expect(isMatchable({ restricted: false, deletedAt: null, consents: noMatching })).toBe(false);
  });

  it("never matches deleted learners", () => {
    expect(isMatchable({ restricted: false, deletedAt: t(0), consents })).toBe(false);
  });
});
