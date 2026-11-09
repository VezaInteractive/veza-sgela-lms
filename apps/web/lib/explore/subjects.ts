/**
 * Subject gap logic for career pages (L-EX-3, L-EX-5). Pure, so it is unit tested. Mathematical
 * Literacy does not count as Mathematics: careers that need Mathematics flag it with a "swap"
 * status instead of a plain "missing".
 */
export type SubjectStatus = "have" | "missing" | "swap";

export interface SubjectCheck {
  code: string;
  required: boolean;
  status: SubjectStatus;
}

export function checkSubjects(
  required: string[],
  recommended: string[],
  mine: Iterable<string>,
): SubjectCheck[] {
  const own = new Set(mine);
  const status = (code: string): SubjectStatus => {
    if (own.has(code)) return "have";
    if (code === "MATHEMATICS" && own.has("MATHEMATICAL_LITERACY")) return "swap";
    return "missing";
  };
  const seen = new Set<string>();
  const out: SubjectCheck[] = [];
  const lists: [string[], boolean][] = [
    [required, true],
    [recommended, false],
  ];
  for (const [list, req] of lists) {
    for (const code of list) {
      if (seen.has(code)) continue;
      seen.add(code);
      out.push({ code, required: req, status: status(code) });
    }
  }
  return out;
}

export function subjectSummary(checks: SubjectCheck[]) {
  const req = checks.filter((c) => c.required);
  return {
    requiredHave: req.filter((c) => c.status === "have").length,
    requiredTotal: req.length,
    missingRequired: req.filter((c) => c.status !== "have").map((c) => c.code),
  };
}

/**
 * L-EX-5: learners in Grade 9 (choosing Grade 10 subjects) see a nudge listing what the career
 * needs. Returns null when no nudge applies.
 */
export function gradeNineNudge(
  grade: number | null | undefined,
  inSchool: boolean,
  required: string[],
): { subjects: string[]; mathsNotLiteracy: boolean } | null {
  if (!inSchool || grade !== 9 || required.length === 0) return null;
  return { subjects: required, mathsNotLiteracy: required.includes("MATHEMATICS") };
}
