import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Badge } from "@sgela/ui";
import { SampleNote } from "@/components/demo/ui";
import { WORLDS } from "@/lib/demo/data";

export async function generateMetadata() {
  const t = await getTranslations("nav");
  return { title: t("explore") };
}

/** Explore index (demo shell for M2-4). */
export default async function ExplorePage() {
  const t = await getTranslations("demo");
  const tw = await getTranslations("worlds");
  return (
    <section className="mx-auto flex max-w-5xl flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-bold md:text-4xl">{t("explore.title")}</h1>
        <p className="text-muted">{t("explore.intro")}</p>
      </div>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {WORLDS.map((w) => (
          <li key={w.code}>
            <Link
              href={"/explore/" + w.code.toLowerCase()}
              className="group flex h-full flex-col gap-3 overflow-hidden rounded-lg border border-border bg-surface transition-colors hover:border-primary"
            >
              <div
                className="h-2 w-full"
                style={{ background: "var(--color-" + w.code.toLowerCase() + ")" }}
                aria-hidden="true"
              />
              <div className="flex flex-col gap-2 px-5 pb-5">
                <span className="flex items-center gap-2">
                  <Badge tone={w.code}>{w.code}</Badge>
                  <span className="font-heading text-xl font-semibold">{tw(w.code)}</span>
                </span>
                <p className="text-sm text-muted">{w.tagline}</p>
                <span className="mt-auto text-sm font-semibold text-link group-hover:underline">
                  {t("explore.careerCount", { count: w.careers.length })}
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
      <SampleNote>{t("sample")}</SampleNote>
    </section>
  );
}
