import { HIGH_SCORE, SIGNAL_WEIGHTS } from "./signals";

/**
 * Personal interest score per career world, 0 to 100 (M2-5, D-034). Deterministic and built from
 * the learner's own records (VR results and LearnerInterest rows), using the same weights as the
 * anonymised signal stream. Drives Compass node size and the "highest-interest world" rule.
 */
export type InterestKind = "WORLD_TOGGLE" | "CAREER_TOGGLE" | "WORLD_VIEW" | "CAREER_VIEW";

export interface InterestInputs {
  vr: { worldCode: string; score: number }[];
  interests: { kind: InterestKind; industryCode: string }[];
}

/** Caps keep one behaviour (many page views) from swamping the score. */
export const CAREER_TOGGLE_CAP = 2;
export const CAREER_VIEW_CAP = 3;

export const MAX_RAW =
  SIGNAL_WEIGHTS.VR_WORLD_PLAYED +
  SIGNAL_WEIGHTS.VR_HIGH_SCORE +
  SIGNAL_WEIGHTS.WORLD_INTEREST_TOGGLE +
  SIGNAL_WEIGHTS.CAREER_INTEREST_TOGGLE * CAREER_TOGGLE_CAP +
  SIGNAL_WEIGHTS.CAREER_VIEW * CAREER_VIEW_CAP;

export function rawInterest(code: string, inputs: InterestInputs): number {
  const scores = inputs.vr.filter((r) => r.worldCode === code).map((r) => r.score);
  const mine = inputs.interests.filter((i) => i.industryCode === code);
  const count = (k: InterestKind) => mine.filter((i) => i.kind === k).length;
  let raw = 0;
  if (scores.length) {
    raw += SIGNAL_WEIGHTS.VR_WORLD_PLAYED;
    if (Math.max(...scores) >= HIGH_SCORE) raw += SIGNAL_WEIGHTS.VR_HIGH_SCORE;
  }
  if (count("WORLD_TOGGLE") > 0) raw += SIGNAL_WEIGHTS.WORLD_INTEREST_TOGGLE;
  raw +=
    SIGNAL_WEIGHTS.CAREER_INTEREST_TOGGLE * Math.min(CAREER_TOGGLE_CAP, count("CAREER_TOGGLE"));
  raw += SIGNAL_WEIGHTS.CAREER_VIEW * Math.min(CAREER_VIEW_CAP, count("CAREER_VIEW"));
  return raw;
}

export function interestScores(codes: string[], inputs: InterestInputs): Record<string, number> {
  const out: Record<string, number> = {};
  for (const code of codes) {
    out[code] = Math.round((100 * rawInterest(code, inputs)) / MAX_RAW);
  }
  return out;
}

/** A world counts as explored once played, opened, liked or one of its careers was opened. */
export function exploredWorlds(inputs: InterestInputs): Set<string> {
  return new Set([
    ...inputs.vr.map((r) => r.worldCode),
    ...inputs.interests.map((i) => i.industryCode),
  ]);
}
