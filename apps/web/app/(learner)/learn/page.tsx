import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Badge } from "@sgela/ui";
import { ProgressBar, SampleNote } from "@/components/demo/ui";
import { COURSES } from "@/lib/demo/data";

export async function generateMetadata() {
  const t = await getTranslations("nav");
  return { title: t("learn") };
}

/** Learn index (demo shell for M3). */
export default async function LearnPage() {
  const t = await getTranslations("demo");
  return (
    <section className="mx-auto flex max-w-5xl flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-bold md:text-4xl">{t("learn.title")}</h1>
        <p className="text-muted">{t("learn.intro")}</p>
      </div>
      <ul className="grid gap-4 md:grid-cols-2">
        {COURSES.map((c) => (
          <li key={c.slug}>
            <Link
              href={"/learn/" + c.slug}
              className="flex h-full flex-col gap-3 rounded-lg border border-border bg-surface p-5 transition-colors hover:border-primary"
            >
              <span className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-semibold text-muted">{c.code}</span>
                {c.world ? <Badge tone={c.world}>{c.world}</Badge> : null}
                {c.accredited ? <Badge tone="lime">{t("learn.accredited")}</Badge> : null}
              </span>
              <span className="font-heading text-lg font-semibold">{c.title}</span>
              <span className="text-sm text-muted">{c.summary}</span>
              <span className="mt-auto flex flex-col gap-1.5 pt-2">
                <span className="flex justify-between text-xs text-muted">
                  <span>{t("learn.minutes", { n: c.minutes })}</span>
                  <span>{t("learn.progress", { n: c.progress })}</span>
                </span>
                <ProgressBar
                  value={c.progress}
                  label={c.title + ": " + t("learn.progress", { n: c.progress })}
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
