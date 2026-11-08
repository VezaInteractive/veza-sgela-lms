import { NextResponse } from "next/server";
import { trackEvent } from "@/lib/analytics/server";
import { getCurrentSession } from "@/lib/auth/session";
import { claimSession, previewClaim } from "@/lib/claim/service";
import { apiError } from "@/lib/http";

const STATUS = {
  INVALID_CODE: 400,
  CLAIM_NOT_FOUND: 404,
  CLAIM_EXPIRED: 410,
  ALREADY_CLAIMED: 409,
} as const;

/** GET /api/v1/claim/:code: public preview, no PII (PRD 12.2). */
export async function GET(_request: Request, ctx: RouteContext<"/api/v1/claim/[code]">) {
  const { code } = await ctx.params;
  const session = await getCurrentSession();
  const result = await previewClaim(code, session?.user.learner?.id ?? null);
  if (!result.ok) return apiError(STATUS[result.code], result.code, "Claim code unavailable");
  return NextResponse.json(result.preview);
}

/** POST /api/v1/claim/:code: authenticated learner links the session (L-ON-7). */
export async function POST(_request: Request, ctx: RouteContext<"/api/v1/claim/[code]">) {
  const { code } = await ctx.params;
  const session = await getCurrentSession();
  const learner = session?.user.learner;
  if (!session) return apiError(401, "UNAUTHENTICATED", "Sign in first");
  if (!learner) return apiError(403, "NOT_ONBOARDED", "Finish your profile first");
  const result = await claimSession(code, learner.id);
  if (!result.ok) {
    await trackEvent({
      name: "claim_failed",
      userId: session.user.id,
      props: { reason: result.code },
    });
    return apiError(STATUS[result.code], result.code, "Could not link this code");
  }
  if (!result.alreadyLinked) {
    await trackEvent({
      name: "claim_linked",
      userId: session.user.id,
      props: { worlds: result.worlds.length },
    });
  }
  return NextResponse.json(result);
}
