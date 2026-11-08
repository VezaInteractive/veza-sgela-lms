"use server";

import { cookies, headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { CONSENT_SCOPES, type ConsentScope } from "@sgela/matching";
import { trackEvent } from "@/lib/analytics/server";
import { requireSession } from "@/lib/auth/rbac";
import { ConsentError, recordConsents } from "@/lib/consent/service";
import { clientIpFrom } from "@/lib/http";
import { LOCALE_COOKIE } from "@/i18n/config";

const CHANGEABLE: ConsentScope[] = ["MATCHING", "PARTNER_CONTACT", "MARKETING"];

/** Privacy centre toggle (L-PF-2). Appends a consent row; never edits history. */
export async function setConsentAction(formData: FormData) {
  const session = await requireSession();
  const learner = session.user.learner;
  if (!learner) return;
  const scope = String(formData.get("scope")) as ConsentScope;
  if (!CONSENT_SCOPES.includes(scope) || !CHANGEABLE.includes(scope)) return;
  const granted = formData.get("granted") === "true";
  try {
    await recordConsents({
      learnerId: learner.id,
      choices: { [scope]: granted },
      actor: "LEARNER",
      locale: (await cookies()).get(LOCALE_COOKIE)?.value ?? "en",
      ip: clientIpFrom(await headers()),
    });
  } catch (err) {
    if (err instanceof ConsentError) return;
    throw err;
  }
  await trackEvent({ name: "consent_updated", userId: session.user.id, props: { scope, granted } });
  revalidatePath("/me/privacy");
}
