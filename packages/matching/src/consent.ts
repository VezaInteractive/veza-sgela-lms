/**
 * Consent resolution (PRD 11.1, 16.4). Consent rows are append-only; for each scope the
 * latest row wins. For minors, only a guardian can grant: a learner-granted row never
 * turns a scope on, but a learner may still withdraw (a later "false" row wins).
 */
export const CONSENT_SCOPES = [
  "PLATFORM",
  "MATCHING",
  "PARTNER_CONTACT",
  "MARKETING",
  "PUBLIC_PORTFOLIO",
  "ACCREDITATION_SHARE",
] as const;
export type ConsentScope = (typeof CONSENT_SCOPES)[number];
export type ConsentActor = "LEARNER" | "GUARDIAN";

export interface ConsentRow {
  scope: ConsentScope;
  granted: boolean;
  grantedBy: ConsentActor;
  createdAt: Date;
}

export interface ResolvedConsent {
  granted: boolean;
  grantedBy: ConsentActor | null;
  at: Date | null;
}

export type ConsentState = Record<ConsentScope, ResolvedConsent>;

/** Latest row per scope (ties keep the row that appears later in the input). */
export function latestPerScope(rows: readonly ConsentRow[]): Map<ConsentScope, ConsentRow> {
  const out = new Map<ConsentScope, ConsentRow>();
  for (const row of rows) {
    const prev = out.get(row.scope);
    if (!prev || row.createdAt.getTime() >= prev.createdAt.getTime()) out.set(row.scope, row);
  }
  return out;
}

export function resolveConsents(
  rows: readonly ConsentRow[],
  opts: { isMinor: boolean },
): ConsentState {
  const usable = opts.isMinor
    ? rows.filter((r) => !(r.grantedBy === "LEARNER" && r.granted))
    : rows;
  const latest = latestPerScope(usable);
  const state = {} as ConsentState;
  for (const scope of CONSENT_SCOPES) {
    const row = latest.get(scope);
    state[scope] = row
      ? { granted: row.granted, grantedBy: row.grantedBy, at: row.createdAt }
      : { granted: false, grantedBy: null, at: null };
  }
  return state;
}

/** Restricted mode (L-ON-4): on until platform-use consent is in place (guardian's for minors). */
export function computeRestricted(state: ConsentState): boolean {
  return !state.PLATFORM.granted;
}
