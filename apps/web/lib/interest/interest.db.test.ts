import { describe, expect, it } from "vitest";
import { createLearner, db } from "@/test/factories";
import { loadInterestSummary, recordView, setInterest } from "./service";

/** A seeded world and one of its careers (M2 seed; present after `pnpm db:seed`). */
async function anyCareer() {
  return db.career.findFirstOrThrow({ select: { id: true, industryCode: true } });
}

describe("interest records and signals (M2-5)", () => {
  it("never puts a learner id column on InterestSignal (PRD 9.3)", async () => {
    const cols = await db.$queryRawUnsafe<{ column_name: string }[]>(
      `select column_name from information_schema.columns where table_name = 'InterestSignal'`,
    );
    const names = cols.map((c) => c.column_name);
    expect(names).toContain("learnerHash");
    expect(names).not.toContain("learnerId");
  });

  it("records a toggle once and emits one anonymised signal with no learner id", async () => {
    const learner = await createLearner({ age: 16 });
    const career = await anyCareer();

    const first = await setInterest(learner.id, {
      industryCode: career.industryCode,
      careerId: career.id,
      on: true,
    });
    expect(first).toEqual({ on: true, signals: 1 });

    // Same toggle again within the day: no duplicate record, no duplicate signal.
    const again = await setInterest(learner.id, {
      industryCode: career.industryCode,
      careerId: career.id,
      on: true,
    });
    expect(again.signals).toBe(0);

    const records = await db.learnerInterest.findMany({
      where: { learnerId: learner.id, kind: "CAREER_TOGGLE" },
    });
    expect(records).toHaveLength(1);

    const signal = await db.interestSignal.findFirstOrThrow({
      where: { signalType: "CAREER_INTEREST_TOGGLE", careerId: career.id },
      orderBy: { id: "desc" },
    });
    expect(signal.weight).toBe(2);
    expect(signal.ageBand).toBe("15-17");
    expect(signal.learnerHash).toMatch(/^[0-9a-f]{64}$/);
    expect(signal.learnerHash).not.toContain(learner.id);

    // Turning it off removes the learner's record but leaves the append-only signal.
    const off = await setInterest(learner.id, {
      industryCode: career.industryCode,
      careerId: career.id,
      on: false,
    });
    expect(off.on).toBe(false);
    expect(
      await db.learnerInterest.count({ where: { learnerId: learner.id, kind: "CAREER_TOGGLE" } }),
    ).toBe(0);
  });

  it("records a career view and raises the interest score", async () => {
    const learner = await createLearner({ age: 20 });
    const career = await anyCareer();

    const before = await loadInterestSummary(learner.id, [career.industryCode]);
    expect(before.scores[career.industryCode]).toBe(0);

    await recordView(learner.id, { industryCode: career.industryCode, careerId: career.id });
    const viewSignal = await db.interestSignal.findFirst({
      where: { signalType: "CAREER_VIEW", careerId: career.id },
      orderBy: { id: "desc" },
    });
    expect(viewSignal?.weight).toBe(1);

    const after = await loadInterestSummary(learner.id, [career.industryCode]);
    expect(after.scores[career.industryCode]!).toBeGreaterThan(0);
    expect(after.explored.has(career.industryCode)).toBe(true);
  });
});
