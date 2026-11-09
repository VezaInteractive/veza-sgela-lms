import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { after } from "next/server";
import { getLocale, getTranslations } from "next-intl/server";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Briefcase,
  CheckCircle2,
  Gamepad2,
  GraduationCap,
  Handshake,
  Star,
  Wallet,
} from "lucide-react";
import { getDb } from "@sgela/db";
import { ColourBar, CourseCard, HeroStats, Panel } from "@/components/dashboard/parts";
import { SampleNote } from "@/components/demo/ui";
import { WORLD_COLOURS, WorldIcon, worldStyle } from "@/components/demo/world-visuals";
import { InterestToggle } from "@/components/explore/interest-toggle";
import { ExploreModelViewer } from "@/components/explore/three-widgets";
import { trackEvent } from "@/lib/analytics/server";
import { requireLearnerPage } from "@/lib/auth/rbac";
import { linkedResults } from "@/lib/claim/service";
import { wantsLessData } from "@/lib/data-saver";
import { COURSES } from "@/lib/demo/data";
import { coursePhoto, worldPhoto } from "@/lib/demo/photos";
import { getWorld } from "@/lib/explore/catalog";
import { checkSubjects, subjectSummary } from "@/lib/explore/subjects";
import { loadToggles, recordView } from "@/lib/interest/service";

export async function generateMetadata({ params }: PageProps<"/explore/[industry]">) {
  const { industry } = await params;
  const t = await getTranslations("worlds");
  const code = industry.toUpperCase();
  return { title: code in WORLD_COLOURS ? t(code as never) : "" };
}

/** Subjects most of the world's careers need, most common first (max 4). */
function worldSubjects(careers: { subjectsRequired: string[] }[]): string[] {
  const count = new Map<string, number>();
  for (const c of careers) {
    for (const s of c.subjectsRequired) count.set(s, (count.get(s) ?? 0) + 1);
  }
  return [...count.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 4)
    .map(([s]) => s);
}

/**
 * Career world page (L-EX-2, M2-4; layout D-029). Photo banner with the learner's best expo
 * score, facts strip, careers from the DB (each with how many of its needed subjects the
 * learner takes), subjects, why it matters, VR world preview, sponsor block and the world's
 * 3D hero object (poster first). Courses stay sample content until M3.
 */
export default async function WorldPage({ params }: PageProps<"/explore/[industry]">) {
  const { industry } = await params;
  const { learner, user } = await requireLearnerPage();
  const locale = await getLocale();
  const w = await getWorld(industry, locale);
  if (!w) notFound();
  const t = await getTranslations("demo");
  const te = await getTranslations("explore");
  const tw = await getTranslations("worlds");
  const ts = await getTranslations("subjects");
  const [subjects, results, saveData, toggles] = await Promise.all([
    getDb().learnerSubject.findMany({
      where: { learnerId: learner.id },
      select: { subjectCode: true },
    }),
    linkedResults(learner.id),
    wantsLessData(),
    loadToggles(learner.id),
  ]);
  after(async () => {
    await recordView(learner.id, { industryCode: w.code });
    await trackEvent({ name: "world_viewed", userId: user.id, props: { world: w.code } });
  });

  const lessData = saveData || learner.dataSaver;
  const mine = new Set(subjects.map((s) => s.subjectCode));
  const scores = results.filter((r) => r.worldCode === w.code).map((r) => r.score);
  const score = scores.length ? Math.max(...scores) : undefined;
  const need = worldSubjects(w.careers);
  const have = need.filter((s) => mine.has(s)).length;
  const courses = COURSES.filter((c) => c.world === w.code);
  const photo = lessData ? undefined : worldPhoto(w.code);
  const colour = WORLD_COLOURS[w.code] ?? w.color;
  const name = tw(w.code as never);

  return (
    <section className="mx-auto flex max-w-7xl flex-col gap-6" style={worldStyle(w.code)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/explore"
          className="flex items-center gap-1.5 text-sm font-semibold text-link hover:underline"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          {t("explore.back")}
        </Link>
        <InterestToggle
          industry={w.code}
          on={toggles.has(w.code)}
          label={te("interested")}
          stateLabel={te("interestedOn")}
        />
      </div>

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
                {name}
              </h1>
              <p className={photo ? "text-white/85 md:text-lg" : "text-muted md:text-lg"}>
                {w.tagline}
              </p>
              {w.sponsor ? (
                <p className={photo ? "text-sm text-white/85" : "text-sm text-muted"}>
                  {te("presentedBy", { world: name, sponsor: w.sponsor.name })}
                </p>
              ) : null}
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
              value: `${have}/${need.length}`,
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
        <Panel title={te("careersIn", { world: name })} accent={colour}>
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {w.careers.map((c) => {
              const sum = subjectSummary(
                checkSubjects(c.subjectsRequired, c.subjectsRecommended, mine),
              );
              const liked = toggles.has(c.id);
              return (
                <li key={c.slug}>
                  <Link
                    href={`/explore/${w.code.toLowerCase()}/careers/${c.slug}`}
                    className="course-card lift group flex h-full flex-col gap-3 rounded-2xl p-5"
                  >
                    <span className="flex items-start justify-between gap-2">
                      <span className="font-heading text-lg leading-snug font-semibold">
                        {c.title}
                      </span>
                      {liked ? (
                        <span className="shrink-0 rounded-full bg-(--glass) px-2 py-0.5 text-xs font-semibold">
                          {te("interestedOn")}
                        </span>
                      ) : null}
                    </span>
                    <span className="text-sm text-muted">{c.summary}</span>
                    <span className="flex items-center gap-2 text-sm font-semibold">
                      <Wallet aria-hidden="true" className="size-4 shrink-0" />
                      <span>
                        <span className="sr-only">{te("salaryTitle")}: </span>
                        {c.salaryBandNote}
                      </span>
                    </span>
                    <span className="flex items-center gap-2 text-sm">
                      <GraduationCap aria-hidden="true" className="size-4 shrink-0" />
                      {sum.requiredTotal
                        ? t("explore.subjectsMatch", {
                            have: sum.requiredHave,
                            total: sum.requiredTotal,
                          })
                        : te("subjectsNone")}
                    </span>
                    <span className="mt-auto flex items-center gap-1 pt-1 text-sm font-semibold">
                      {te("viewCareer")}
                      <ArrowRight
                        aria-hidden="true"
                        className="size-4 transition-transform group-hover:translate-x-1"
                      />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Panel>

        <div className="flex min-w-0 flex-col gap-6">
          {w.heroAsset ? (
            <Panel title={te("model3dTitle")} accent={colour}>
              <ExploreModelViewer
                glbUrl={w.heroAsset.glbUrl}
                posterUrl={w.heroAsset.posterUrl}
                sizeBytes={w.heroAsset.glbSizeBytes}
                alt={te("poster3d", { name: w.heroAsset.name })}
                accent={colour}
                labels={{
                  load: te("view3d"),
                  loading: te("loading3d"),
                  reset: te("reset3d"),
                  noWebgl: te("noWebgl"),
                  failed: te("failed3d"),
                  canvas: te("canvas3d", { name: w.heroAsset.name }),
                }}
              />
            </Panel>
          ) : null}

          <Panel title={t("explore.subjectsTitle")}>
            <div className="flex flex-col gap-1.5">
              <ColourBar
                value={Math.round((have / Math.max(1, need.length)) * 100)}
                colour={colour}
                label={t("explore.subjectsMatch", { have, total: need.length })}
              />
              <span className="text-xs font-medium text-muted">
                {t("explore.subjectsMatch", { have, total: need.length })}
              </span>
            </div>
            <ul className="flex flex-col gap-2">
              {need.map((s) => {
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
              {w.whyItMatters.map((x) => (
                <li key={x} className="flex gap-2.5 text-sm">
                  <CheckCircle2 aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-link" />
                  {x}
                </li>
              ))}
            </ul>
          </Panel>

          {w.vrSummary ? (
            <Panel title={te("vrTitle")}>
              <p className="flex gap-2.5 text-sm">
                <Gamepad2 aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-link" />
                {w.vrSummary}
              </p>
              <p className="text-xs text-muted">{te("vrNote")}</p>
            </Panel>
          ) : null}

          {w.sponsor ? (
            <Panel title={te("sponsorTitle")}>
              <p className="flex gap-2.5 text-sm">
                <Handshake aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-link" />
                {te("sponsorBody", { sponsor: w.sponsor.name, world: name })}
              </p>
            </Panel>
          ) : null}
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
          <SampleNote>{t("sample")}</SampleNote>
        </div>
      ) : null}
    </section>
  );
}
