import { NextResponse } from "next/server";
import { z } from "zod";
import { normaliseEmail } from "@sgela/contracts";
import { trackEvent } from "@/lib/analytics/server";
import { verifyOtp } from "@/lib/auth/otp";
import { startSession } from "@/lib/auth/session";
import { apiError, readJson } from "@/lib/http";

const bodySchema = z.object({
  email: z.string().min(3).max(254),
  code: z.string().regex(/^\d{6}$/),
  trustDevice: z.boolean().default(true),
});

/** POST /api/v1/auth/otp/verify: { email, code } then session cookie (PRD 12.2, L-ON-10, D-039). */
export async function POST(request: Request) {
  const json = await readJson(request);
  if (!json.ok) return apiError(400, "INVALID_JSON", "Body must be JSON");
  const parsed = bodySchema.safeParse(json.body);
  const email = parsed.success ? normaliseEmail(parsed.data.email) : null;
  if (!parsed.success || !email)
    return apiError(400, "INVALID_INPUT", "Email and 6-digit code required");
  const result = await verifyOtp({ email, code: parsed.data.code });
  if (!result.ok) {
    const status =
      result.code === "WRONG_CODE" ? 401 : result.code === "TOO_MANY_ATTEMPTS" ? 429 : 400;
    return apiError(
      status,
      result.code,
      "Code not accepted",
      "attemptsLeft" in result ? { attemptsLeft: result.attemptsLeft } : undefined,
    );
  }
  await startSession(result.userId, parsed.data.trustDevice);
  await trackEvent({
    name: result.isNew ? "account_created" : "otp_verified",
    userId: result.userId,
  });
  return NextResponse.json({ userId: result.userId, isNew: result.isNew });
}
