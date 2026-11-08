import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { maskPhone } from "@sgela/contracts";
import { StepHeader } from "@/components/onboarding/step-header";
import { VerifyForm } from "@/components/onboarding/verify-form";

export async function generateMetadata() {
  return { title: (await getTranslations("start"))("verifyTitle") };
}

export default async function VerifyPage() {
  const phone = (await cookies()).get("sgela_otp_phone")?.value;
  if (!phone) redirect("/start");
  const t = await getTranslations("start");
  return (
    <>
      <StepHeader
        title={t("verifyTitle")}
        intro={t("verifyIntro", { phone: maskPhone(phone) })}
        step={2}
        total={4}
      />
      <VerifyForm />
    </>
  );
}
