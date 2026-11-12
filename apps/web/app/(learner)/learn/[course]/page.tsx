import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import {
  ArrowLeft,
  BadgeCheck,
  BarChart3,
  Box,
  CheckCircle2,
  Clock,
  FileText,
  Hash,
  Lock,
  PlayCircle,
  Star,
  Video,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@sgela/ui";
import { IctCourseSection } from "@/components/learn/ict-course-section";
import { ColourBar } from "@/components/dashboard/parts";
import { SampleNote } from "@/components/demo/ui";
import { WORLD_COLOURS, WorldIcon, worldStyle } from "@/components/demo/world-visuals";
import { wantsLessData } from "@/lib/data-saver";
import { getCourse } from "@/lib/demo/data";
import { coursePhoto } from "@/lib/demo/photos";

export async function generateMetadata({ params }: PageProps<"/learn/[course]">) {
  const { course } = await params;
  if (course === "ict-basics") return { title: "Career-Ready: ICT Basics" };
  return { title: getCourse(course)?.title ?? "" };
}

function resourceIcon(r: string): LucideIcon {
  if (r.startsWith("3D")) return Box;
  if (r.startsWith("Video")) return Video;
  return FileText;
}

/**
 * Course page (D-026, reference "MyCourses" detail): photo and summary, a facts row
 * (credits, level, code, length, provider), Modules and Resources side by side, and the
 * two main actions. Demo shell for M3: lessons and 3D models open in the next release.
 */
export default async function CoursePage({ params }: PageProps<"/learn/[course]">) {
  const { course: slug } = await params;
  // The ICT Basics course is a real interactive course (D-040), not the demo detail shell.
  if (slug === "ict-basics") return <IctCourseSection />;
  const c = getCourse(slug);
  if (!c) notFound();
  const t = await getTranslations("demo");
  const lessData = await wantsLessData();
  const photo = lessData ? undefined : coursePhoto(c.slug);
  const world = c.world ?? "READY";
  const colour = WORLD_COLOURS[world]!;
  const statusLabel =
    c.progress >= 100
      ? t("learn.statusDone")
      : c.progress > 0
        ? t("learn.statusActive")
        : t("learn.statusNew");
  const status = { done: t("learn.done"), current: t("learn.current"), locked: t("learn.locked") };
  const facts: { icon: LucideIcon; value: string; label: string }[] = [
    {
      icon: Star,
      value: c.credits > 0 ? String(c.credits) : "-",
      label: c.credits > 0 ? t("learn.credits") : t("learn.noCredits"),
    },
    { icon: BarChart3, value: t(`learn.levels.${c.level}`), label: t("learn.levelLabel") },
    { icon: Hash, value: c.code, label: t("learn.codeLabel") },
    { icon: Clock, value: t("learn.minutes", { n: c.minutes }), label: t("learn.length") },
  ];

  return (
    <section className="mx-auto flex max-w-6xl flex-col gap-6" style={worldStyle(world)}>
      <Link
        href="/learn"
        className="flex items-center gap-1.5 self-start text-sm font-semibold text-link hover:underline"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        {t("learn.back")}
      </Link>

      {/* Hero: photo + title, status and summary */}
      <div className="glass grid gap-6 overflow-hidden rounded-3xl p-4 md:grid-cols-[minmax(0,22rem)_1fr] md:p-6">
        <div className="course-card relative aspect-4/3 overflow-hidden rounded-2xl">
          {photo ? (
            <Image
              src={photo}
              alt=""
              fill
              priority
              sizes="(min-width: 768px) 22rem, 100vw"
              className="object-cover"
            />
          ) : (
            <span className="flex size-full items-center justify-center">
              <WorldIcon code={world} size="xl" className="course-card-icon" />
            </span>
          )}
        </div>
        <div className="flex min-w-0 flex-col justify-center gap-3">
          <span className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
              {statusLabel}
            </span>
            {c.accredited ? (
              <span className="flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs font-semibold">
                <BadgeCheck aria-hidden="true" className="size-3.5" />
                {t("learn.accredited")}
              </span>
            ) : null}
          </span>
          <h1 className="font-heading text-3xl leading-tight font-semibold md:text-4xl">
            {c.title}
          </h1>
          <p className="max-w-2xl text-muted">{c.summary}</p>
          <div className="flex max-w-md flex-col gap-1.5 pt-1">
            <ColourBar
              value={c.progress}
              colour={colour}
              label={t("learn.completion", { n: c.progress })}
              className="h-2.5"
            />
            <span className="text-sm font-medium text-muted">
              {t("learn.completion", { n: c.progress })}
            </span>
          </div>
        </div>
      </div>

      {/* Facts row (reference: credits, level, code, completion, instructor) */}
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-5">
        {facts.map(({ icon: Icon, value, label }) => (
          <li key={label} className="glass flex items-center gap-3 rounded-2xl p-4">
            <span
              aria-hidden="true"
              className="stat-chip flex size-11 shrink-0 items-center justify-center rounded-xl"
            >
              <Icon className="size-5" />
            </span>
            <span className="flex min-w-0 flex-col-reverse">
              <span className="text-xs text-muted">{label}</span>
              <span className="font-heading text-lg leading-tight font-bold break-words">
                {value}
              </span>
            </span>
          </li>
        ))}
        <li className="glass col-span-2 flex items-center gap-3 rounded-2xl p-4 md:col-span-4 xl:col-span-1">
          <span
            aria-hidden="true"
            className="flex size-11 shrink-0 items-center justify-center rounded-full bg-ink font-heading text-sm font-bold text-lime-500"
          >
            {c.provider.slice(0, 1)}
          </span>
          <span className="flex min-w-0 flex-col-reverse">
            <span className="text-xs text-muted">{t("learn.provider")}</span>
            <span className="line-clamp-2 text-sm font-semibold">{c.provider}</span>
          </span>
        </li>
      </ul>

      {/* Modules and Resources side by side */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <section className="glass flex flex-col gap-1 rounded-2xl p-5 md:p-6">
          <h2 className="mb-2 font-heading text-lg font-semibold">{t("learn.modules")}</h2>
          <ol className="flex flex-col gap-2">
            {c.topics.map((tp, i) => {
              const Icon =
                tp.status === "done" ? CheckCircle2 : tp.status === "current" ? PlayCircle : Lock;
              return (
                <li
                  key={tp.title}
                  className={
                    "flex items-center gap-3 rounded-xl border p-3 " +
                    (tp.status === "current" ? "border-primary" : "border-border")
                  }
                >
                  <span
                    aria-hidden="true"
                    className={
                      "flex size-9 shrink-0 items-center justify-center rounded-full " +
                      (tp.status === "done"
                        ? "bg-primary text-primary-foreground"
                        : tp.status === "current"
                          ? "stat-chip"
                          : "bg-surface-raised text-muted")
                    }
                  >
                    <Icon className="size-4" />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span
                      className={
                        tp.status === "locked" ? "text-sm text-muted" : "text-sm font-semibold"
                      }
                    >
                      {i + 1}. {tp.title}
                    </span>
                    <span className="flex items-center gap-2 text-xs text-muted">
                      {t("learn.moduleMeta", { n: tp.minutes })}
                      {tp.has3d ? (
                        <span className="flex items-center gap-1">
                          <Box aria-hidden="true" className="size-3" />
                          {t("learn.has3d")}
                        </span>
                      ) : null}
                    </span>
                  </span>
                  <span className="shrink-0 text-xs font-semibold text-muted">
                    {status[tp.status]}
                  </span>
                </li>
              );
            })}
          </ol>
        </section>

        <section className="glass flex flex-col gap-1 rounded-2xl p-5 md:p-6">
          <h2 className="mb-2 font-heading text-lg font-semibold">{t("learn.resources")}</h2>
          <ul className="flex flex-col gap-2">
            {c.resources.map((r) => {
              const Icon = resourceIcon(r);
              return (
                <li key={r} className="flex items-center gap-3 rounded-xl border border-border p-3">
                  <span
                    aria-hidden="true"
                    className="stat-chip flex size-9 shrink-0 items-center justify-center rounded-lg"
                  >
                    <Icon className="size-4" />
                  </span>
                  <span className="text-sm">{r}</span>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      {/* Actions (reference: Interactive Lesson / Start Exam) */}
      <div className="glass flex flex-col gap-3 rounded-2xl p-5 sm:flex-row sm:items-center">
        <div className="flex flex-wrap gap-3">
          <Button size="lg" disabled aria-describedby="lessons-soon">
            <PlayCircle aria-hidden="true" className="size-5" />
            {t("learn.openLesson")}
          </Button>
          <Button size="lg" variant="secondary" disabled aria-describedby="lessons-soon">
            <Box aria-hidden="true" className="size-5" />
            {t("learn.open3d")}
          </Button>
        </div>
        <p id="lessons-soon" className="flex items-center gap-1.5 text-sm text-muted sm:ml-auto">
          <Lock aria-hidden="true" className="size-4 shrink-0" />
          {t("learn.lessonsSoon")}
        </p>
      </div>
      <SampleNote>{t("sample")}</SampleNote>
    </section>
  );
}
