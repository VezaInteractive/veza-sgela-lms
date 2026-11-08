import type { ConsentState } from "./consent";

export interface MatchCandidate {
  restricted: boolean;
  deletedAt: Date | null;
  consents: ConsentState;
}

/**
 * Hard gate applied before any scoring (PRD 7.8, L-ON-4). Restricted learners (minors
 * without guardian consent) are never matchable, discoverable or invitable.
 */
export function isMatchable(c: MatchCandidate): boolean {
  if (c.deletedAt) return false;
  if (c.restricted) return false;
  return c.consents.PLATFORM.granted && c.consents.MATCHING.granted;
}
