import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Button, Card, CardTitle } from "@sgela/ui";
import { signOutAction, signOutEverywhereAction } from "@/app/(auth)/start/actions";
import { AddExpoCode } from "@/components/add-expo-code";
import { SampleNote } from "@/components/demo/ui";
import { WorldResults } from "@/components/world-results";
import { BADGES, CREDENTIALS } from "@/lib/demo/data";
import { requireLearnerPage } from "@/lib/auth/rbac";
import { linkedResults } from "@/lib/claim/service";
import { isMinor } from "@/lib/onboarding/steps";

export async function generateMetadata() {
  const t = await getTranslations("nav");
  return { title: t("me") };
}

export default async function MePage() {
  const { learner } = await requireLearnerPage();
  const t = await getTranslations();
  const td = await getTranslations("demo");
  const results = await linkedResults(learner.id);
  const waiting = learner.restricted && isMinor(learner.dateOfBirth) && learner.guardian;

  return (
    <section className="mx-auto flex max-w-3xl flex-col gap-6">
      <h1 className="font-heading text-3xl font-bold md:text-4xl">
        {t("me.greeting", { name: learner.firstName })}
      </h1>

      {waiting ? (
        <Card className="flex flex-col gap-2 border-warning" data-testid="restricted-banner">
          <CardTitle>{t("me.restrictedTitle")}</CardTitle>
          <p className="text-sm">{t("me.restrictedBody", { guardian: learner.guardian!.name })}</p>
          <Link href="/start/guardian" className="text-sm text-link underline">
            {t("me.resendGuardian")}
          </Link>
        </Card>
      ) : null}

      <Card className="flex flex-col gap-3">
        <CardTitle>{t("me.resultsTitle")}</CardTitle>
        {results.length > 0 ? (
          <WorldResults results={results} simulatedLabel={t("me.simulated")} />
        ) : (
          <p className="text-sm text-muted">{t("me.resultsEmpty")}</p>
        )}
      </Card>

      <Card className="flex flex-col gap-3">
        <CardTitle>{td("me.badges")}</CardTitle>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {BADGES.map((b) => (
            <li
              key={b.code}
              className={
                "flex flex-col items-center gap-1 rounded-md border p-3 text-center text-xs " +
                (b.earned ? "border-primary" : "border-dashed border-border text-muted")
              }
            >
              <span aria-hidden="true" className="text-2xl">
                {b.earned ? "★" : "☆"}
              </span>
              <span className="font-semibold">{b.name}</span>
              <span>{b.earned ? td("me.earned") : td("me.notYet")}</span>
            </li>
          ))}
        </ul>
        <CardTitle className="mt-2">{td("me.credentials")}</CardTitle>
        <ul className="flex flex-col gap-2 text-sm">
          {CREDENTIALS.map((c) => (
            <li key={c.title} className="rounded-md border border-border p-3">
              <p className="font-semibold">{c.title}</p>
              <p className="text-xs text-muted">
                {c.issuer} · {c.issued} · {c.kind}
              </p>
            </li>
          ))}
        </ul>
        <SampleNote>{td("sample")}</SampleNote>
      </Card>
      <Card className="flex flex-col gap-3">
        <CardTitle>{t("claim.addTitle")}</CardTitle>
        <p className="text-sm text-muted">{t("claim.addIntro")}</p>
        <AddExpoCode />
      </Card>

      <Card className="flex flex-col gap-3">
        <CardTitle>{t("me.account")}</CardTitle>
        <Link href="/me/privacy" className="text-link underline">
          {t("me.privacy")}
        </Link>
        <div className="flex flex-wrap gap-3">
          <form action={signOutAction}>
            <Button type="submit" variant="secondary">
              {t("common.signOut")}
            </Button>
          </form>
          <form action={signOutEverywhereAction}>
            <Button type="submit" variant="ghost">
              {t("common.signOutEverywhere")}
            </Button>
          </form>
        </div>
      </Card>
    </section>
  );
}
