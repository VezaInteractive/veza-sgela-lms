import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import {
  ArrowLeft,
  BookOpen,
  Briefcase,
  CheckCircle2,
  GraduationCap,
  Route,
  Star,
  Wallet,
} from "lucide-react";
import { getDb } from "@sgela/db";
import { ColourBar, CourseCard, HeroStats, Panel } from "@/components/dashboard/parts";
import { SampleNote } from "@/components/demo/ui";
import { WORLD_COLOURS, WorldIcon, worldStyle } from "@/components/demo/world-visuals";
import { requireLearnerPage } from "@/lib/auth/rbac";
import { linkedResults } from "@/lib/claim/service";
import { wantsLessData } from "@/lib/data-saver";
import { COURSES, getWorld } from "@/lib/demo/data";
import { coursePhoto, worldPhoto } from "@/lib/demo/photos";

export async function generateMetadata({ params }: PageProps<"/explore/[world]">) {
  const { world } = await params;
  const t = await getTranslations("worlds");
  const w = getWorld(world);
  return { title: w ? t(w.code) : "" };
}

/**
 * Career world page (D-029; demo shell for M2-4). Photo banner with the learner's real expo
 * score, a facts strip, careers with pay and study routes, why it matters, the subjects needed
 * checked against the learner's real subjects, and the world's courses.
 */
export default async function WorldPage({ params }: PageProps<"/explore/[world]">) {
  const { world } = await params;
  const w = getWorld(world);
  if (!w) notFound();
  const { learner } = await requireLearnerPage();
  const t = await getTranslations("demo");
  const tw = await getTranslations("worlds");
  const ts = await getTranslations("subjects");
  const [subjects, results, lessData] = await Promise.all([
    getDb().learnerSubject.findMany({
      where: { learnerId: learner.id },
      select: { subjectCode: true },
    }),
    linkedResults(learner.id),
    wantsLessData(),
  ]);
  const mine = new Set(subjects.map((s) => s.subjectCode));
  const scores = results.filter((r) => r.worldCode === w.code).map((r) => r.score);
  const score = scores.length ? Math.max(...scores) : undefined;
  const have = w.subjects.filter((s) => mine.has(s)).length;
  const courses = COURSES.filter((c) => c.world === w.code);
  const photo = lessData ? undefined : worldPhoto(w.code);
  const colour = WORLD_COLOURS[w.code]!;

  return (
    <section className="mx-auto flex max-w-7xl flex-col gap-6" style={worldStyle(w.code)}>
      <Link
        href="/explore"
        className="flex items-center gap-1.5 self-start text-sm font-semibold text-link hover:underline"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        {t("explore.back")}
      </Link>

      {/* Banner: photo with name and the learner's expo score on a dark gradient */}
      <div
        className={
          "relative isolate flex min-h-64 flex-col justify-end overflow-hidden rounded-3xl md:min-h-80 " +
          (photo ? "bg-space text-white" : "course-card")
        }
      >
        {photo ? (
          <>
            <Image
              src={photo}
              alt=""
              fill
              priority
              sizes="(min-width: 1280px) 80rem, 100vw"
              className="-z-20 object-cover"
            />
            <span
              aria-hidden="true"
              className="absolute inset-0 -z-10 bg-linear-to-t from-black/85 via-black/35 to-black/5"
            />
          </>
        ) : null}
        <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-end sm:justify-between md:p-8">
          <div className="flex min-w-0 flex-col items-start gap-3 sm:flex-row sm:items-end sm:gap-4">
            <WorldIcon code={w.code} size="xl" className="course-card-icon" />
            <div className="flex min-w-0 flex-col gap-1">
              <h1 className="font-heading text-3xl leading-none font-bold break-words sm:text-4xl md:text-5xl">
                {tw(w.code)}
              </h1>
              <p className={photo ? "text-white/85 md:text-lg" : "text-muted md:text-lg"}>
                {w.tagline}
              </p>
            </div>
          </div>
          <div
            className={
              "flex shrink-0 items-center gap-3 self-start rounded-2xl px-4 py-3 sm:self-auto " +
              (photo ? "border border-white/30 bg-black/40" : "glass")
            }
          >
            <Star aria-hidden="true" className="size-5" />
            <span className="flex flex-col">
              <span className="font-heading text-2xl leading-none font-bold tabular-nums">
                {score ?? "-"}
              </span>
              <span className={photo ? "text-xs text-white/85" : "text-xs text-muted"}>
                {score !== undefined ? t("explore.yourScore") : t("home.notPlayed")}
              </span>
            </span>
          </div>
        </div>
      </div>

      <div className="glass rounded-2xl p-5 md:p-6">
        <HeroStats
          stats={[
            {
              label: t("explore.careers"),
              value: String(w.careers.length),
              icon: Briefcase,
              accent: colour,
            },
            {
              label: t("explore.subjectsTake"),
              value: `${have}/${w.subjects.length}`,
              icon: GraduationCap,
              accent: "#9B7BFF",
            },
            {
              label: t("explore.courses"),
              value: String(courses.length),
              icon: BookOpen,
              accent: "#4FA3FF",
            },
            {
              label: t("explore.yourScore"),
              value: score !== undefined ? String(score) : "-",
              icon: Star,
              accent: "#FFB547",
            },
          ]}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Panel title={t("explore.careers")}>
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {w.careers.map((c) => (
              <li key={c.slug} className="course-card flex flex-col gap-3 rounded-2xl p-5">
                <span className="font-heading text-lg leading-snug font-semibold">{c.title}</span>
                <span className="text-sm text-muted">{c.summary}</span>
                <span className="flex items-center gap-2 text-sm font-semibold">
                  <Wallet aria-hidden="true" className="size-4 shrink-0" />
                  <span>
                    <span className="sr-only">{t("explore.salary")}: </span>
                    {c.salary}
                  </span>
                </span>
                <span className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold tracking-wide text-muted uppercase">
                    {t("explore.routes")}
                  </span>
                  <ul className="flex flex-col gap-1">
                    {c.routes.map((r) => (
                      <li key={r} className="flex items-start gap-2 text-sm">
                        <Route aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </span>
              </li>
            ))}
          </ul>
        </Panel>

        <div className="flex min-w-0 flex-col gap-6">
          <Panel title={t("explore.subjectsTitle")}>
            <div className="flex flex-col gap-1.5">
              <ColourBar
                value={Math.round((have / Math.max(1, w.subjects.length)) * 100)}
                colour={colour}
                label={t("explore.subjectsMatch", { have, total: w.subjects.length })}
              />
              <span className="text-xs font-medium text-muted">
                {t("explore.subjectsMatch", { have, total: w.subjects.length })}
              </span>
            </div>
            <ul className="flex flex-col gap-2">
              {w.subjects.map((s) => {
                const has = mine.has(s);
                return (
                  <li
                    key={s}
                    className="flex items-center justify-between gap-2 rounded-xl border border-border p-3 text-sm"
                  >
                    <span className="font-medium">{ts(s as never)}</span>
                    <span
                      className={
                        has
                          ? "rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-primary-foreground"
                          : "rounded-full border border-dashed border-border px-2.5 py-0.5 text-xs text-muted"
                      }
                    >
                      {has ? t("explore.have") : t("explore.missing")}
                    </span>
                  </li>
                );
              })}
            </ul>
          </Panel>

          <Panel title={t("explore.why")}>
            <ul className="flex flex-col gap-2.5">
              {w.why.map((x) => (
                <li key={x} className="flex gap-2.5 text-sm">
                  <CheckCircle2 aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-link" />
                  {x}
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>

      {courses.length > 0 ? (
        <div className="flex flex-col gap-4">
          <h2 className="font-heading text-xl font-semibold">{t("explore.courses")}</h2>
          <ul className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {courses.map((c) => (
              <li key={c.slug}>
                <CourseCard
                  course={c}
                  photo={lessData ? undefined : coursePhoto(c.slug)}
                  labels={{
                    minutes: t("learn.minutes", { n: c.minutes }),
                    topics: t("learn.topicCount", { n: c.topics.length }),
                    complete: t("learn.complete", { n: c.progress }),
                    accredited: t("learn.accredited"),
                    progressLabel: c.title + ": " + t("learn.complete", { n: c.progress }),
                  }}
                />
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <SampleNote>{t("sample")}</SampleNote>
    </section>
  );
}
