import { NextResponse } from "next/server";
import { z } from "zod";
import { normaliseSaMobile } from "@sgela/contracts";
import { getTranslations } from "next-intl/server";
import { trackEvent } from "@/lib/analytics/server";
import { requestOtp } from "@/lib/auth/otp";
import { apiError, clientIpFrom, readJson } from "@/lib/http";

const bodySchema = z.object({ phone: z.string().min(9).max(25), purpose: z.string().optional() });

/** POST /api/v1/auth/otp/request: { phone } then 202 (PRD 12.2, L-ON-2). */
export async function POST(request: Request) {
  const json = await readJson(request);
  if (!json.ok) return apiError(400, "INVALID_JSON", "Body must be JSON");
  const parsed = bodySchema.safeParse(json.body);
  const phoneE164 = parsed.success ? normaliseSaMobile(parsed.data.phone) : null;
  if (!phoneE164) return apiError(400, "INVALID_PHONE", "Enter a South African mobile number");
  const t = await getTranslations("sms");
  const result = await requestOtp({
    phoneE164,
    ip: clientIpFrom(request.headers),
    message: (code) => t("otp", { code }),
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
  await trackEvent({ name: "otp_requested", props: { channel: "sms" } });
  return new NextResponse(null, { status: 202 });
}
