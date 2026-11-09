import { describe, expect, it } from "vitest";
import { MAX_RAW, exploredWorlds, interestScores, rawInterest } from "./score";
import {
  SIGNAL_TYPES,
  SIGNAL_WEIGHTS,
  ageBand,
  buildSignal,
  dedupeSignals,
  gradeBand,
  quarterOf,
  vrSignalTypes,
} from "./signals";

const NOW = new Date("2026-11-10T10:00:00Z");
const learner = {
  id: "learner_123",
  dateOfBirth: new Date("2010-01-15"),
  provinceCode: "LP",
  districtCode: "DC34",
  grade: 10,
  schoolQuintile: 2,
};

describe("interest signal emitter (PRD 9.3)", () => {
  it("uses the PRD weights", () => {
    expect(SIGNAL_WEIGHTS).toMatchObject({
      VR_WORLD_PLAYED: 3,
      VR_HIGH_SCORE: 2,
      WORLD_INTEREST_TOGGLE: 2,
      CAREER_VIEW: 1,
      COURSE_ENROL: 3,
      TOPIC_COMPLETE: 2,
      CREDENTIAL: 5,
      OPPORTUNITY_ACCEPT: 4,
    });
  });

  it.each(SIGNAL_TYPES)("builds an anonymised %s signal with bands and no learner id", (type) => {
    const row = buildSignal(learner, { type, industryCode: "AGR", careerId: "c1" }, NOW);
    expect(row).toMatchObject({
      signalType: type,
      weight: SIGNAL_WEIGHTS[type],
      industryCode: "AGR",
      careerId: "c1",
      provinceCode: "LP",
      districtCode: "DC34",
      ageBand: "15-17",
      gradeBand: "10-12",
      schoolQuintile: 2,
      source: "PLATFORM",
    });
    expect(row.learnerHash).toMatch(/^[0-9a-f]{64}$/);
    expect(JSON.stringify(row)).not.toContain(learner.id);
    expect(Object.keys(row)).not.toContain("learnerId");
  });

  it("hashes one learner the same within a quarter and differently across quarters", () => {
    const at = (d: Date) => buildSignal(learner, { type: "CAREER_VIEW", industryCode: "AGR" }, d);
    const a = at(NOW);
    expect(at(new Date("2026-12-31T10:00:00Z")).learnerHash).toBe(a.learnerHash);
    expect(at(new Date("2027-01-01T10:00:00Z")).learnerHash).not.toBe(a.learnerHash);
    expect(quarterOf(NOW)).toBe("2026Q4");
  });

  it("bands ages and grades", () => {
    expect([14, 15, 17, 18, 24, 25, 35, 36].map(ageBand)).toEqual([
      "<15",
      "15-17",
      "15-17",
      "18-24",
      "18-24",
      "25-35",
      "25-35",
      "36+",
    ]);
    expect([null, 8, 9, 10, 12].map(gradeBand)).toEqual([null, "8-9", "8-9", "10-12", "10-12"]);
  });

  it("emits a high-score signal at 75 and above", () => {
    expect(vrSignalTypes(74)).toEqual(["VR_WORLD_PLAYED"]);
    expect(vrSignalTypes(75)).toEqual(["VR_WORLD_PLAYED", "VR_HIGH_SCORE"]);
  });

  it("de-duplicates against recent signals and within the batch", () => {
    const rows = [
      { signalType: "CAREER_VIEW", industryCode: "AGR", careerId: "c1" },
      { signalType: "CAREER_VIEW", industryCode: "AGR", careerId: "c1" },
      { signalType: "CAREER_VIEW", industryCode: "AGR", careerId: "c2" },
      { signalType: "WORLD_INTEREST_TOGGLE", industryCode: "AGR", careerId: null },
    ];
    const recent = [{ signalType: "CAREER_VIEW", industryCode: "AGR", careerId: "c2" }];
    expect(dedupeSignals(rows, recent)).toEqual([rows[0], rows[3]]);
  });
});

describe("personal interest score", () => {
  it("is zero with no activity and 100 at the cap", () => {
    expect(interestScores(["AVI"], { vr: [], interests: [] })).toEqual({ AVI: 0 });
    const full = {
      vr: [{ worldCode: "AVI", score: 90 }],
      interests: [
        { kind: "WORLD_TOGGLE" as const, industryCode: "AVI" },
        ...Array.from({ length: 4 }, () => ({
          kind: "CAREER_TOGGLE" as const,
          industryCode: "AVI",
        })),
        ...Array.from({ length: 9 }, () => ({ kind: "CAREER_VIEW" as const, industryCode: "AVI" })),
      ],
    };
    expect(rawInterest("AVI", full)).toBe(MAX_RAW);
    expect(interestScores(["AVI"], full)).toEqual({ AVI: 100 });
  });

  it("weights expo play, high scores, likes and views", () => {
    const played = { vr: [{ worldCode: "MED", score: 66 }], interests: [] };
    expect(rawInterest("MED", played)).toBe(3);
    const high = {
      vr: [
        { worldCode: "MED", score: 66 },
        { worldCode: "MED", score: 80 },
      ],
      interests: [],
    };
    expect(rawInterest("MED", high)).toBe(5);
    const liked = { vr: [], interests: [{ kind: "WORLD_TOGGLE" as const, industryCode: "MED" }] };
    expect(rawInterest("MED", liked)).toBe(2);
    const opened = { vr: [], interests: [{ kind: "WORLD_VIEW" as const, industryCode: "MED" }] };
    expect(rawInterest("MED", opened)).toBe(0);
  });

  it("counts a world as explored when played, opened, liked or a career was opened", () => {
    const inputs = {
      vr: [{ worldCode: "AVI", score: 50 }],
      interests: [
        { kind: "WORLD_VIEW" as const, industryCode: "ENG" },
        { kind: "CAREER_VIEW" as const, industryCode: "MED" },
      ],
    };
    expect([...exploredWorlds(inputs)].sort()).toEqual(["AVI", "ENG", "MED"]);
  });
});
