import { getTranslations } from "next-intl/server";
import { Badge, Card, CardDescription } from "@sgela/ui";

type PageKey = "home" | "explore" | "learn" | "opportunities" | "me";

/** M0 placeholder: real screens arrive in M1-M5. */
export async function PlaceholderPage({ page }: { page: PageKey }) {
  const t = await getTranslations();
  return (
    <section className="mx-auto flex max-w-3xl flex-col gap-6">
      <h1 className="font-heading text-3xl font-bold md:text-4xl">
        {t("pages." + page + ".title")}
      </h1>
      <Card>
        <Badge tone="lime">{t("common.comingSoon")}</Badge>
        <CardDescription className="mt-3 text-base">{t("pages." + page + ".body")}</CardDescription>
      </Card>
    </section>
  );
}
