import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { maskEmail } from "@sgela/contracts";
import { devOutbox, isConsoleMessaging } from "@sgela/messaging";
import { devPagesEnabled } from "@/lib/dev-pages";
import { StepHeader } from "@/components/onboarding/step-header";
import { VerifyForm } from "@/components/onboarding/verify-form";

export async function generateMetadata() {
  return { title: (await getTranslations("start"))("verifyTitle") };
}

export default async function VerifyPage() {
  const email = (await cookies()).get("sgela_otp_email")?.value;
  if (!email) redirect("/start");
  const t = await getTranslations("start");
  // No email vendor is connected yet (EMAIL_PROVIDER=console, D-039): show the code locally so
  // people can sign in. Never shown when a real email vendor or production mode is active.
  const devCode =
    isConsoleMessaging() && devPagesEnabled()
      ? devOutbox()
          .filter((m) => m.channel === "email" && m.to === email)
          .at(-1)
          ?.text.match(/\b\d{6}\b/)?.[0]
      : undefined;
  return (
    <>
      <StepHeader
        title={t("verifyTitle")}
        intro={t("verifyIntro", { email: maskEmail(email) })}
        step={2}
        total={4}
      />
      {devCode ? (
        <div
          role="note"
          data-testid="dev-otp"
          className="rounded-2xl border-2 border-dashed border-warning bg-surface px-4 py-3 text-sm"
        >
          <p className="font-semibold">{t("devCodeTitle")}</p>
          <p className="mt-1">
            {t("devCodeBody")}{" "}
            <span className="font-heading text-xl font-bold tracking-widest">{devCode}</span>
          </p>
        </div>
      ) : null}
      <VerifyForm />
    </>
  );
}
