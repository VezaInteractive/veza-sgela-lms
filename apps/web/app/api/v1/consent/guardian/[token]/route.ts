import { NextResponse } from "next/server";
import { z } from "zod";
import { trackEvent } from "@/lib/analytics/server";
import { respondAsGuardian } from "@/lib/guardian/service";
import { apiError, clientIpFrom, readJson } from "@/lib/http";

const bodySchema = z.object({
  agree: z.boolean(),
  matching: z.boolean().default(false),
  partnerContact: z.boolean().default(false),
  locale: z.enum(["en", "zu", "st"]).default("en"),
});

/** POST /api/v1/consent/guardian/:token: guardian grants or declines scopes (PRD 12.2). */
export async function POST(
  request: Request,
  ctx: RouteContext<"/api/v1/consent/guardian/[token]">,
) {
  const { token } = await ctx.params;
  const json = await readJson(request);
  if (!json.ok) return apiError(400, "INVALID_JSON", "Body must be JSON");
  const parsed = bodySchema.safeParse(json.body);
  if (!parsed.success)
    return apiError(400, "INVALID_CONSENT", "Invalid consent payload", parsed.error.issues);
  const result = await respondAsGuardian({
    token,
    agree: parsed.data.agree,
    choices: {
      PLATFORM: true,
      MATCHING: parsed.data.matching,
      PARTNER_CONTACT: parsed.data.partnerContact,
    },
    locale: parsed.data.locale,
    ip: clientIpFrom(request.headers),
  });
  if (!result.ok) return apiError(404, result.code, "This consent link is invalid or has expired");
  await trackEvent({ name: "guardian_consent_responded", props: { agree: parsed.data.agree } });
  if (!result.restricted) await trackEvent({ name: "consent_complete", props: { by: "GUARDIAN" } });
  return NextResponse.json({ restricted: result.restricted });
}
