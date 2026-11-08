import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { trackEvent } from "@/lib/analytics/server";
import { runGuardianReminders } from "@/lib/guardian/service";
import { apiError } from "@/lib/http";

/**
 * POST /api/cron/guardian-reminders: the `guardian.reminders` job (PRD 13.4). Call every
 * 15 minutes from a scheduler with `Authorization: Bearer $CRON_SECRET` (D-016).
 */
export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET;
  const given = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  const ok =
    !!secret &&
    given.length === secret.length &&
    timingSafeEqual(Buffer.from(given), Buffer.from(secret));
  if (!ok) return apiError(401, "UNAUTHENTICATED", "Cron secret required");
  const result = await runGuardianReminders();
  if (result.sent > 0)
    await trackEvent({ name: "guardian_reminder_sent", props: { count: result.sent } });
  return NextResponse.json(result);
}
