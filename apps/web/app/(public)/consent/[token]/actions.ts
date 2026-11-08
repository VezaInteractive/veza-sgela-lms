"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { trackEvent } from "@/lib/analytics/server";
import { respondAsGuardian } from "@/lib/guardian/service";
import { clientIpFrom } from "@/lib/http";
import { LOCALE_COOKIE } from "@/i18n/config";

/** Guardian taps I agree / I do not agree on /consent/[token] (L-ON-5). */
export async function guardianRespondAction(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  const agree = formData.get("decision") === "agree";
  const locale = (await cookies()).get(LOCALE_COOKIE)?.value ?? "en";
  const result = await respondAsGuardian({
    token,
    agree,
    choices: {
      PLATFORM: true,
      MATCHING: !!formData.get("MATCHING"),
      PARTNER_CONTACT: !!formData.get("PARTNER_CONTACT"),
    },
    locale,
    ip: clientIpFrom(await headers()),
  });
  if (!result.ok) redirect("/consent/" + encodeURIComponent(token));
  await trackEvent({ name: "guardian_consent_responded", props: { agree } });
  if (!result.restricted) await trackEvent({ name: "consent_complete", props: { by: "GUARDIAN" } });
  redirect("/consent/" + encodeURIComponent(token) + "?done=" + (agree ? "agree" : "decline"));
}
