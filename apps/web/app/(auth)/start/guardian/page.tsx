import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { GuardianForm } from "@/components/onboarding/guardian-form";
import { StepHeader } from "@/components/onboarding/step-header";
import { requireSignedInPage } from "@/lib/auth/rbac";
import { isMinor } from "@/lib/onboarding/steps";

export async function generateMetadata() {
  return { title: (await getTranslations("guardian"))("title") };
}

/** Under-18s name a guardian (L-ON-4). Also reachable from Me to change or resend. */
export default async function GuardianPage() {
  const session = await requireSignedInPage();
  const learner = session.user.learner;
  if (!learner) redirect("/start/profile");
  if (!isMinor(learner.dateOfBirth)) redirect("/start/consent");
  const t = await getTranslations("guardian");
  return (
    <>
      <StepHeader title={t("title")} intro={t("intro")} step={4} total={4} />
      <GuardianForm />
    </>
  );
}
