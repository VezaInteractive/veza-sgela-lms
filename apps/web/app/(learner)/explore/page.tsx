import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import { SampleNote } from "@/components/demo/ui";
import { WorldIcon, worldStyle } from "@/components/demo/world-visuals";
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
        <h1 className="font-heading text-4xl font-bold md:text-5xl">{t("explore.title")}</h1>
        <p className="text-muted">{t("explore.intro")}</p>
      </div>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {WORLDS.map((w) => (
          <li key={w.code}>
            <Link
              href={"/explore/" + w.code.toLowerCase()}
              style={worldStyle(w.code)}
              className="world-tint lift group flex h-full flex-col gap-4 rounded-3xl p-6"
            >
              <WorldIcon code={w.code} size="xl" />
              <span className="font-heading text-2xl font-bold">{tw(w.code)}</span>
              <span className="text-sm text-muted">{w.tagline}</span>
              <span className="mt-auto flex items-center gap-1 text-sm font-semibold text-link">
                {t("explore.careerCount", { count: w.careers.length })}
                <ArrowRight
                  className="size-4 transition-transform group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <SampleNote>{t("sample")}</SampleNote>
    </section>
  );
}
