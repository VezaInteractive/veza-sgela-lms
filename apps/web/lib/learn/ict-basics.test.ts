import { describe, expect, it } from "vitest";
import { ICT_BASICS, isCorrect, totalQuestions, type Question } from "./ict-basics";

const questions: Question[] = ICT_BASICS.topics.flatMap((t) =>
  t.blocks.flatMap((b) => (b.question ? [b.question] : [])),
);

describe("ICT Basics content", () => {
  it("has four topics and question ids are unique", () => {
    expect(ICT_BASICS.topics).toHaveLength(4);
    expect(ICT_BASICS.topics.map((t) => t.session)).toEqual([
      "Session 1",
      "Session 2",
      "Session 3",
      "Session 4",
    ]);
    expect(ICT_BASICS.unit.id).toBe("14921");
    expect(ICT_BASICS.unit.outcomes.length).toBeGreaterThan(0);
    const ids = questions.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(totalQuestions()).toBe(questions.length);
  });

  it("choice and match questions have valid correct answers", () => {
    for (const q of questions) {
      if (q.kind === "choice") {
        expect(q.answer).toBeGreaterThanOrEqual(0);
        expect(q.answer).toBeLessThan(q.options.length);
      }
      if (q.kind === "match") {
        const defs = q.pairs.map((p) => p.def);
        expect(new Set(defs).size).toBe(defs.length);
      }
    }
  });

  it("marks the model answer correct for every question", () => {
    for (const q of questions) {
      if (q.kind === "choice") expect(isCorrect(q, q.answer)).toBe(true);
      if (q.kind === "boolean") expect(isCorrect(q, q.answer)).toBe(true);
      if (q.kind === "blank") expect(isCorrect(q, q.accept[0]!)).toBe(true);
      if (q.kind === "match") {
        const map = Object.fromEntries(q.pairs.map((p) => [p.term, p.def]));
        expect(isCorrect(q, map)).toBe(true);
      }
    }
  });

  it("rejects wrong answers and blanks", () => {
    const choice = questions.find((q) => q.kind === "choice")!;
    expect(isCorrect(choice, null)).toBe(false);
    const blank = questions.find((q) => q.kind === "blank")!;
    expect(isCorrect(blank, "definitely wrong")).toBe(false);
    const bool = questions.find((q) => q.kind === "boolean")!;
    if (bool.kind === "boolean") expect(isCorrect(bool, !bool.answer)).toBe(false);
  });

  it("blank matching is case- and space-insensitive", () => {
    const blank = ICT_BASICS.topics[1]!.blocks.find((b) => b.question?.kind === "blank")!.question!;
    expect(isCorrect(blank, "  BUS ")).toBe(true);
  });

  it("match is wrong when any pair is mismatched", () => {
    const match = questions.find((q) => q.kind === "match")!;
    if (match.kind !== "match") return;
    const bad = Object.fromEntries(match.pairs.map((p) => [p.term, "wrong"]));
    expect(isCorrect(match, bad)).toBe(false);
  });
});
