import { getTranslations } from "next-intl/server";
import { Card } from "@sgela/ui";
import { ConsentChoices } from "@/components/onboarding/consent-choices";
import { SubmitButton } from "@/components/onboarding/submit-button";
import { CONSENT_TEXT_VERSION } from "@/lib/consent/service";
import { findGuardianByToken } from "@/lib/guardian/service";
import { guardianRespondAction } from "./actions";

export async function generateMetadata() {
  return { title: (await getTranslations("consent"))("guardianChoose"), robots: { index: false } };
}

/** L-ON-5: plain-language guardian consent page in en/zu/st (language switcher in the header). */
export default async function GuardianConsentPage({
  params,
  searchParams,
}: PageProps<"/consent/[token]">) {
  const { token } = await params;
  const { done } = await searchParams;
  const t = await getTranslations("consent");
  const guardian = await findGuardianByToken(token);

  if (!guardian) {
    return (
      <>
        <h1 className="font-heading text-2xl font-bold">{t("invalidTitle")}</h1>
        <p className="text-muted">{t("invalidBody")}</p>
      </>
    );
  }
  const name = guardian.learner.firstName;

  if (done === "agree" || done === "decline" || guardian.respondedAt) {
    const agreed = done ? done === "agree" : !guardian.learner.restricted;
    return (
      <>
        <h1 className="font-heading text-2xl font-bold" data-testid="guardian-thanks">
          {t("guardianThanks")}
        </h1>
        <p className="text-muted">
          {t(agreed ? "guardianThanksAgree" : "guardianThanksDecline", { name })}
        </p>
      </>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-2xl font-bold md:text-3xl">
          {t("guardianTitle", { name })}
        </h1>
        <p>{t("guardianIntro", { name })}</p>
      </div>
      <Card className="flex flex-col gap-2">
        <h2 className="font-heading text-lg font-semibold">{t("guardianWhatTitle")}</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm">
          <li>{t("guardianWhat1")}</li>
          <li>{t("guardianWhat2")}</li>
          <li>{t("guardianWhat3", { name })}</li>
          <li>{t("guardianWhat4")}</li>
        </ul>
      </Card>
      <form action={guardianRespondAction} className="flex flex-col gap-5">
        <input type="hidden" name="token" value={token} />
        <h2 className="font-heading text-lg font-semibold">{t("guardianChoose")}</h2>
        <ConsentChoices scopes={["MATCHING", "PARTNER_CONTACT"]} platformRequired={false} />
        <p className="text-xs text-muted">{t("version", { version: CONSENT_TEXT_VERSION })}</p>
        <SubmitButton name="decision" value="agree">
          {t("agree")}
        </SubmitButton>
        <SubmitButton name="decision" value="decline" variant="secondary">
          {t("decline")}
        </SubmitButton>
      </form>
    </>
  );
}
