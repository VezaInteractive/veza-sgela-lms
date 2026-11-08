import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getDb } from "@sgela/db";
import { Badge, Card, CardTitle } from "@sgela/ui";
import { ProgressBar, SampleNote } from "@/components/demo/ui";
import { WorldIcon, worldStyle } from "@/components/demo/world-visuals";
import { requireLearnerPage } from "@/lib/auth/rbac";
import { COURSES, getWorld } from "@/lib/demo/data";

export async function generateMetadata({ params }: PageProps<"/explore/[world]">) {
  const { world } = await params;
  const t = await getTranslations("worlds");
  const w = getWorld(world);
  return { title: w ? t(w.code) : "" };
}

/** World page (demo shell for M2-4): careers, subject gaps against the learner real subjects. */
export default async function WorldPage({ params }: PageProps<"/explore/[world]">) {
  const { world } = await params;
  const w = getWorld(world);
  if (!w) notFound();
  const { learner } = await requireLearnerPage();
  const t = await getTranslations("demo");
  const tw = await getTranslations("worlds");
  const ts = await getTranslations("subjects");
  const mine = new Set(
    (
      await getDb().learnerSubject.findMany({
        where: { learnerId: learner.id },
        select: { subjectCode: true },
      })
    ).map((s) => s.subjectCode),
  );
  const courses = COURSES.filter((c) => c.world === w.code);

  return (
    <section className="mx-auto flex max-w-5xl flex-col gap-6">
      <Link href="/explore" className="text-sm text-link underline">
        {t("explore.back")}
      </Link>
      <div
        style={worldStyle(w.code)}
        className="world-tint fade-up flex flex-col gap-5 rounded-3xl p-6 sm:flex-row sm:items-center md:p-10"
      >
        <WorldIcon code={w.code} size="xl" />
        <div className="flex flex-col gap-2">
          <Badge tone={w.code} className="self-start">
            {w.code}
          </Badge>
          <h1 className="font-heading text-4xl font-bold md:text-5xl">{tw(w.code)}</h1>
          <p className="text-lg text-muted">{w.tagline}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="glass flex flex-col gap-2 rounded-2xl">
          <CardTitle>{t("explore.why")}</CardTitle>
          <ul className="list-disc space-y-1 pl-5 text-sm">
            {w.why.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </Card>
        <Card className="glass flex flex-col gap-2 rounded-2xl">
          <CardTitle>{t("explore.subjectsTitle")}</CardTitle>
          <ul className="flex flex-col gap-2 text-sm">
            {w.subjects.map((s) => {
              const has = mine.has(s);
              return (
                <li key={s} className="flex items-center justify-between gap-2">
                  <span>{ts(s as never)}</span>
                  <span
                    className={
                      has
                        ? "rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground"
                        : "rounded-full border border-dashed border-border px-2 py-0.5 text-xs text-muted"
                    }
                  >
                    {has ? t("explore.have") : t("explore.missing")}
                  </span>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-heading text-xl font-semibold">{t("explore.careers")}</h2>
        <ul className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {w.careers.map((c) => (
            <li key={c.slug}>
              <Card
                style={worldStyle(w.code)}
                className="world-tint lift flex h-full flex-col gap-2 rounded-2xl"
              >
                <CardTitle>{c.title}</CardTitle>
                <p className="text-sm">{c.summary}</p>
                <p className="text-xs text-muted">
                  {t("explore.salary")}: {c.salary}
                </p>
                <p className="text-xs font-semibold">{t("explore.routes")}</p>
                <ul className="list-disc pl-5 text-xs text-muted">
                  {c.routes.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              </Card>
            </li>
          ))}
        </ul>
      </div>

      {courses.length > 0 ? (
        <div className="flex flex-col gap-3">
          <h2 className="font-heading text-xl font-semibold">{t("explore.courses")}</h2>
          {courses.map((c) => (
            <Link
              key={c.slug}
              href={"/learn/" + c.slug}
              className="flex flex-col gap-2 rounded-lg border border-border bg-surface p-4 hover:border-primary"
            >
              <span className="font-semibold">{c.title}</span>
              <ProgressBar value={c.progress} label={t("learn.progress", { n: c.progress })} />
            </Link>
          ))}
        </div>
      ) : null}
      <SampleNote>{t("sample")}</SampleNote>
    </section>
  );
}
