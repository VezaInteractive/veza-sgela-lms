import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { PartyPopper } from "lucide-react";
import { Button } from "@sgela/ui";
import { FormError } from "@/components/onboarding/field-error";
import { WorldResults } from "@/components/world-results";
import { requireSignedInPage } from "@/lib/auth/rbac";
import { linkedResults } from "@/lib/claim/service";
import { onboardingPath } from "@/lib/onboarding/steps";

export async function generateMetadata() {
  return { title: (await getTranslations("start"))("doneReady") };
}

const CLAIM_ERRORS: Record<string, string> = {
  ALREADY_CLAIMED: "usedTitle",
  CLAIM_EXPIRED: "expiredTitle",
  CLAIM_NOT_FOUND: "invalidTitle",
  INVALID_CODE: "invalidTitle",
};

export default async function DonePage({ searchParams }: PageProps<"/start/done">) {
  const session = await requireSignedInPage();
  const learner = session.user.learner;
  const next = onboardingPath(learner);
  if (next) redirect(next);
  const { claim } = await searchParams;
  const t = await getTranslations();
  const results = await linkedResults(learner!.id);
  const claimError = typeof claim === "string" ? CLAIM_ERRORS[claim] : undefined;

  return (
    <>
      <span
        aria-hidden="true"
        className="flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-[0_0_32px_-6px_var(--primary)]"
      >
        <PartyPopper className="size-7" />
      </span>
      <h1 className="font-heading text-3xl leading-tight font-bold md:text-4xl">
        <span className="text-accent">{t("start.doneTitle", { name: learner!.firstName })}</span>
      </h1>
      <p className="text-muted" data-testid="restricted-note">
        {learner!.restricted ? t("start.doneRestricted") : t("start.doneReady")}
      </p>
      {claimError ? <FormError message={t(("claim." + claimError) as never)} /> : null}
      {results.length > 0 ? (
        <div className="flex flex-col gap-3">
          <h2 className="font-heading text-lg font-semibold">{t("start.doneResults")}</h2>
          <WorldResults results={results} simulatedLabel={t("me.simulated")} />
        </div>
      ) : (
        <p className="text-sm text-muted">{t("start.doneNoResults")}</p>
      )}
      <Button asChild size="lg">
        <Link href="/home">{t("start.goToCompass")}</Link>
      </Button>
    </>
  );
}
