import { getTranslations } from "next-intl/server";
import { Button, Card } from "@sgela/ui";
import { requireLearnerPage } from "@/lib/auth/rbac";
import { CONSENT_TEXT_VERSION, loadConsentState } from "@/lib/consent/service";
import { isMinor } from "@/lib/onboarding/steps";
import { setConsentAction } from "../actions";

const SCOPES = ["PLATFORM", "MATCHING", "PARTNER_CONTACT", "MARKETING"] as const;

export async function generateMetadata() {
  return { title: (await getTranslations("privacy"))("title") };
}

/** Privacy centre basics (L-PF-2 view/change). Each change appends a Consent row. */
export default async function PrivacyPage() {
  const { learner } = await requireLearnerPage();
  const t = await getTranslations();
  const state = await loadConsentState(learner);
  const minor = isMinor(learner.dateOfBirth);

  return (
    <section className="mx-auto flex max-w-3xl flex-col gap-6">
      <h1 className="font-heading text-3xl font-bold">{t("privacy.title")}</h1>
      <p className="text-muted">{t("privacy.intro")}</p>
      {minor ? <p className="text-sm">{t("privacy.minorNote")}</p> : null}
      <ul className="flex flex-col gap-3">
        {SCOPES.map((scope) => {
          const s = state[scope];
          const canTurnOn = !minor && scope !== "PLATFORM";
          const canTurnOff = scope !== "PLATFORM";
          return (
            <li key={scope}>
              <Card className="flex flex-col gap-2" data-testid={"consent-" + scope}>
                <div className="flex items-start justify-between gap-3">
                  <span className="font-semibold">{t(("consent." + scope) as never)}</span>
                  <span className="shrink-0 rounded-full border border-border px-2.5 py-0.5 text-xs font-semibold">
                    {s.granted ? t("privacy.granted") : t("privacy.notGranted")}
                  </span>
                </div>
                <p className="text-sm text-muted">{t(("consent." + scope + "Help") as never)}</p>
                {s.grantedBy ? (
                  <p className="text-xs text-muted">
                    {s.grantedBy === "GUARDIAN" ? t("privacy.byGuardian") : t("privacy.byYou")}
                  </p>
                ) : null}
                {scope === "PLATFORM" ? (
                  <p className="text-xs text-muted">{t("privacy.platformLocked")}</p>
                ) : s.granted && canTurnOff ? (
                  <form action={setConsentAction}>
                    <input type="hidden" name="scope" value={scope} />
                    <input type="hidden" name="granted" value="false" />
                    <Button type="submit" variant="secondary" size="sm">
                      {t("privacy.turnOff")}
                    </Button>
                  </form>
                ) : !s.granted && canTurnOn ? (
                  <form action={setConsentAction}>
                    <input type="hidden" name="scope" value={scope} />
                    <input type="hidden" name="granted" value="true" />
                    <Button type="submit" size="sm">
                      {t("privacy.turnOn")}
                    </Button>
                  </form>
                ) : null}
              </Card>
            </li>
          );
        })}
      </ul>
      <p className="text-xs text-muted">
        {t("consent.version", { version: CONSENT_TEXT_VERSION })}
      </p>
    </section>
  );
}
