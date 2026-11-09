import { describe, expect, it } from "vitest";
import { checkSubjects, gradeNineNudge, subjectSummary } from "./subjects";

describe("subject gaps (L-EX-3)", () => {
  it("marks subjects the learner takes and the ones missing", () => {
    const checks = checkSubjects(
      ["MATHEMATICS", "PHYSICAL_SCIENCE"],
      ["IT", "MATHEMATICS"],
      ["MATHEMATICS", "LIFE_SCIENCES"],
    );
    expect(checks).toEqual([
      { code: "MATHEMATICS", required: true, status: "have" },
      { code: "PHYSICAL_SCIENCE", required: true, status: "missing" },
      { code: "IT", required: false, status: "missing" },
    ]);
    expect(subjectSummary(checks)).toEqual({
      requiredHave: 1,
      requiredTotal: 2,
      missingRequired: ["PHYSICAL_SCIENCE"],
    });
  });

  it("does not count Mathematical Literacy as Mathematics", () => {
    const checks = checkSubjects(["MATHEMATICS"], [], ["MATHEMATICAL_LITERACY"]);
    expect(checks).toEqual([{ code: "MATHEMATICS", required: true, status: "swap" }]);
    expect(subjectSummary(checks)).toMatchObject({
      requiredHave: 0,
      missingRequired: ["MATHEMATICS"],
    });
  });
});

describe("Grade 9 subject nudge (L-EX-5)", () => {
  it("shows only for Grade 9 learners in school, for careers with required subjects", () => {
    expect(gradeNineNudge(9, true, ["MATHEMATICS", "PHYSICAL_SCIENCE"])).toEqual({
      subjects: ["MATHEMATICS", "PHYSICAL_SCIENCE"],
      mathsNotLiteracy: true,
    });
    expect(gradeNineNudge(9, true, ["LIFE_SCIENCES"])).toEqual({
      subjects: ["LIFE_SCIENCES"],
      mathsNotLiteracy: false,
    });
    expect(gradeNineNudge(10, true, ["MATHEMATICS"])).toBeNull();
    expect(gradeNineNudge(9, false, ["MATHEMATICS"])).toBeNull();
    expect(gradeNineNudge(9, true, [])).toBeNull();
  });
});
