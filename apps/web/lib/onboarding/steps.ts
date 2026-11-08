/** Age and onboarding routing rules (L-ON-3/4/6). Pure, so they are unit-tested. */
export const ADULT_AGE = 18;
const SAST_OFFSET_MS = 2 * 60 * 60_000;

/** Whole years between a date of birth (date-only, UTC) and "today" in South Africa. */
export function ageOn(dateOfBirth: Date, now: Date = new Date()): number {
  const today = new Date(now.getTime() + SAST_OFFSET_MS);
  let age = today.getUTCFullYear() - dateOfBirth.getUTCFullYear();
  const beforeBirthday =
    today.getUTCMonth() < dateOfBirth.getUTCMonth() ||
    (today.getUTCMonth() === dateOfBirth.getUTCMonth() &&
      today.getUTCDate() < dateOfBirth.getUTCDate());
  if (beforeBirthday) age -= 1;
  return age;
}

export function isMinor(dateOfBirth: Date, now: Date = new Date()): boolean {
  return ageOn(dateOfBirth, now) < ADULT_AGE;
}

export interface OnboardingLearner {
  dateOfBirth: Date;
  restricted: boolean;
  guardian: unknown | null;
}

/**
 * Where a signed-in user still needs to go, or null when onboarding is finished.
 * Minors are finished once a guardian has been asked (they continue in restricted mode).
 */
export function onboardingPath(
  learner: OnboardingLearner | null,
  now: Date = new Date(),
): string | null {
  if (!learner) return "/start/profile";
  if (isMinor(learner.dateOfBirth, now)) return learner.guardian ? null : "/start/guardian";
  return learner.restricted ? "/start/consent" : null;
}
