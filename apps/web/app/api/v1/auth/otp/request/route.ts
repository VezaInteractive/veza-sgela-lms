import { NextResponse } from "next/server";
import { z } from "zod";
import { normaliseEmail } from "@sgela/contracts";
import { getTranslations } from "next-intl/server";
import { trackEvent } from "@/lib/analytics/server";
import { requestOtp } from "@/lib/auth/otp";
import { apiError, clientIpFrom, readJson } from "@/lib/http";

const bodySchema = z.object({ email: z.string().min(3).max(254), purpose: z.string().optional() });

/** POST /api/v1/auth/otp/request: { email } then 202 (PRD 12.2, L-ON-2, D-039). */
export async function POST(request: Request) {
  const json = await readJson(request);
  if (!json.ok) return apiError(400, "INVALID_JSON", "Body must be JSON");
  const parsed = bodySchema.safeParse(json.body);
  const email = parsed.success ? normaliseEmail(parsed.data.email) : null;
  if (!email) return apiError(400, "INVALID_EMAIL", "Enter a valid email address");
  const t = await getTranslations("email");
  const result = await requestOtp({
    email,
    ip: clientIpFrom(request.headers),
    subject: t("subject"),
    message: (code) => t("body", { code }),
  });
  if (!result.ok) {
    return NextResponse.json(
      {
        error: {
          code: result.code,
          message: "Too many codes requested",
          details: { retryAfterSec: result.retryAfterSec },
        },
      },
      { status: 429, headers: { "retry-after": String(result.retryAfterSec) } },
    );
  }
  await trackEvent({ name: "otp_requested", props: { channel: "email" } });
  return new NextResponse(null, { status: 202 });
}
