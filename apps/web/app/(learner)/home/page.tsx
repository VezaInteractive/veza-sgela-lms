import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Badge, Card, CardDescription, CardTitle } from "@sgela/ui";
import { WorldResults } from "@/components/world-results";
import { requireLearnerPage } from "@/lib/auth/rbac";
import { linkedResults } from "@/lib/claim/service";

export async function generateMetadata() {
  const t = await getTranslations("nav");
  return { title: t("home") };
}

/** Career Compass placeholder until M2: shows the learner linked expo worlds so claiming feels real. */
export default async function HomePage() {
  const { learner } = await requireLearnerPage();
  const t = await getTranslations();
  const results = await linkedResults(learner.id);

  return (
    <section className="mx-auto flex max-w-3xl flex-col gap-6">
      <h1 className="font-heading text-3xl font-bold md:text-4xl">{t("pages.home.title")}</h1>
      {results.length > 0 ? (
        <Card className="flex flex-col gap-3">
          <CardTitle>{t("pages.home.resultsTitle")}</CardTitle>
          <WorldResults results={results} simulatedLabel={t("me.simulated")} />
          <CardDescription className="text-base">{t("pages.home.bodyClaimed")}</CardDescription>
        </Card>
      ) : (
        <Card className="flex flex-col gap-3">
          <Badge tone="lime" className="self-start">
            {t("common.comingSoon")}
          </Badge>
          <CardDescription className="text-base">{t("pages.home.body")}</CardDescription>
          <Link href="/me" className="text-link underline">
            {t("pages.home.addCode")}
          </Link>
        </Card>
      )}
    </section>
  );
}
