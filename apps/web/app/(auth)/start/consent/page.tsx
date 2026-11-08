import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ActionForm } from "@/components/onboarding/action-form";
import { ConsentChoices, OPTIONAL_SCOPES } from "@/components/onboarding/consent-choices";
import { StepHeader } from "@/components/onboarding/step-header";
import { SubmitButton } from "@/components/onboarding/submit-button";
import { requireSignedInPage } from "@/lib/auth/rbac";
import { CONSENT_TEXT_VERSION } from "@/lib/consent/service";
import { isMinor } from "@/lib/onboarding/steps";
import { saveOwnConsentAction } from "../actions";

export async function generateMetadata() {
  return { title: (await getTranslations("consent"))("title") };
}

/** Learners aged 18+ give their own opt-ins (L-ON-6). */
export default async function ConsentPage() {
  const session = await requireSignedInPage();
  const learner = session.user.learner;
  if (!learner) redirect("/start/profile");
  if (isMinor(learner.dateOfBirth)) redirect("/start/guardian");
  if (!learner.restricted) redirect("/home");
  const t = await getTranslations("consent");
  return (
    <>
      <StepHeader title={t("title")} intro={t("intro")} step={4} total={4} />
      <ActionForm action={saveOwnConsentAction}>
        <ConsentChoices scopes={OPTIONAL_SCOPES} platformRequired />
        <p className="text-xs text-muted">{t("version", { version: CONSENT_TEXT_VERSION })}</p>
        <SubmitButton>{t("save")}</SubmitButton>
      </ActionForm>
    </>
  );
}
