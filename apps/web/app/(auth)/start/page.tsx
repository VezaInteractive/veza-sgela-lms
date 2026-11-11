import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { EmailForm } from "@/components/onboarding/email-form";
import { StepHeader } from "@/components/onboarding/step-header";
import { getCurrentSession } from "@/lib/auth/session";
import { onboardingPath } from "@/lib/onboarding/steps";

export async function generateMetadata() {
  return { title: (await getTranslations("start"))("title") };
}

export default async function StartPage() {
  const session = await getCurrentSession();
  if (session && !session.user.learner && session.user.role !== "LEARNER") {
    redirect("/admin/insights");
  }
  if (session) redirect(onboardingPath(session.user.learner) ?? "/home");
  const t = await getTranslations("start");
  return (
    <>
      <StepHeader title={t("title")} intro={t("intro")} step={1} total={4} />
      <EmailForm />
    </>
  );
}
