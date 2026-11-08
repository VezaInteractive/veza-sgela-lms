import { redirect } from "next/navigation";
import type { UserRole } from "@sgela/db";
import { getCurrentSession, type CurrentSession } from "./session";
import { onboardingPath } from "@/lib/onboarding/steps";

/**
 * Server-side RBAC helpers (PRD 15). Every data access starts from one of these; the client
 * is never trusted for identity or role.
 */
export class AuthError extends Error {
  constructor(public code: "UNAUTHENTICATED" | "FORBIDDEN" | "NOT_ONBOARDED") {
    super(code);
  }
}

/** For route handlers: returns the session or throws AuthError. */
export async function requireSession(): Promise<CurrentSession> {
  const s = await getCurrentSession();
  if (!s) throw new AuthError("UNAUTHENTICATED");
  return s;
}

export async function requireRole(...roles: UserRole[]): Promise<CurrentSession> {
  const s = await requireSession();
  if (!roles.includes(s.user.role)) throw new AuthError("FORBIDDEN");
  return s;
}

/** For pages: signed-in user with a finished onboarding, else redirect to the right step. */
export async function requireLearnerPage() {
  const s = await getCurrentSession();
  if (!s) redirect("/start");
  const next = onboardingPath(s.user.learner);
  if (next) redirect(next);
  return { session: s, user: s.user, learner: s.user.learner! };
}

/** For onboarding pages: must be signed in. */
export async function requireSignedInPage() {
  const s = await getCurrentSession();
  if (!s) redirect("/start");
  return s;
}
