import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { ArrowRight, Award, Bell, Flame, Sparkles, Trophy } from "lucide-react";
import { Button } from "@sgela/ui";
import { ColourBar, PageIntro, Panel, ProgressRing, StatStrip } from "@/components/dashboard/parts";
import { SampleNote, ScoreRing } from "@/components/demo/ui";
import {
  CareerCompass,
  WORLD_COLOURS,
  WorldIcon,
  worldStyle,
} from "@/components/demo/world-visuals";
import { requireLearnerPage } from "@/lib/auth/rbac";
import { linkedResults } from "@/lib/claim/service";
import { BADGES, COURSES, LEARNER_STATS, NOTICES, OPPORTUNITIES, WORLDS } from "@/lib/demo/data";

export async function generateMetadata() {
  const t = await getTranslations("nav");
  return { title: t("home") };
}

/** Topic bar colours, cycled (decorative; each bar has its topic name and % in text). */
const BAR_COLOURS = ["#4FA3FF", "#FFB547", "#FF6B5A", "#3FD1B5", "#ABCF37", "#9B7BFF"];
const TOPIC_PROGRESS = { done: 100, current: 35, locked: 0 } as const;

/**
 * Learner dashboard (D-021, reference "Dashboard" layout). The Career Compass and world
 * scores come from the learner's real linked expo results; stats, course progress, up next,
 * notices and the top match are sample content until M2-M5 (D-018).
 */
export default async function HomePage() {
  const { learner } = await requireLearnerPage();
  const t = await getTranslations("demo");
  const tw = await getTranslations("worlds");
  const locale = await getLocale();
  const fmt = new Intl.DateTimeFormat(locale === "en" ? "en-ZA" : locale, {
    day: "numeric",
    month: "short",
  });

  const results = await linkedResults(learner.id);
  const best = new Map<string, number>();
  for (const r of results) best.set(r.worldCode, Math.max(best.get(r.worldCode) ?? 0, r.score));
  const focus = [...WORLDS].sort((a, b) => (best.get(b.code) ?? -1) - (best.get(a.code) ?? -1))[0]!;

  const s = LEARNER_STATS;
  const course = COURSES.find((c) => c.progress > 0) ?? COURSES[0]!;
  const courseColour = WORLD_COLOURS[course.world ?? "AGR"]!;
  const upNext = COURSES.flatMap((c) =>
    c.topics.filter((tp) => tp.status === "current").map((tp) => ({ course: c, topic: tp })),
  ).slice(0, 3);
  const top = OPPORTUNITIES[0]!;

  return (
    <section className="mx-auto flex max-w-7xl flex-col gap-6">
      <PageIntro
        title={t("home.welcome", { name: learner.firstName })}
        intro={t("home.welcomeBody")}
      >
        <Button asChild>
          <Link href={"/explore/" + focus.code.toLowerCase()}>
            {t("home.nextBody", { world: tw(focus.code) })}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </Button>
      </PageIntro>

      <StatStrip
        stats={[
          {
            label: t("home.statLevel"),
            value: t("home.statLevelValue", { level: s.level }),
            icon: Trophy,
            accent: "#ABCF37",
          },
          {
            label: t("home.statStreak"),
            value: String(s.streakDays),
            icon: Flame,
            accent: "#FF6B5A",
          },
          {
            label: t("home.statXp"),
            value: t("home.statXpValue", { xp: s.xp, next: s.nextLevelXp }),
            icon: Sparkles,
            accent: "#4FA3FF",
          },
          {
            label: t("home.statBadges"),
            value: String(BADGES.filter((b) => b.earned).length),
            icon: Award,
            accent: "#9B7BFF",
          },
        ]}
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <Panel
          title={t("home.progressTitle", { course: course.title })}
          action={{ href: "/learn/" + course.slug, label: t("learn.continue") }}
          className="xl:col-span-7"
        >
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
            <ProgressRing
              value={course.progress}
              caption={t("home.progressCaption")}
              label={t("home.progressAlt", { course: course.title, n: course.progress })}
              colour={courseColour}
            />
            <ul className="grid w-full flex-1 gap-x-6 gap-y-4 sm:grid-cols-2">
              {course.topics.map((tp, i) => {
                const v = TOPIC_PROGRESS[tp.status];
                return (
                  <li key={tp.title} className="flex flex-col gap-1.5">
                    <span className="flex items-baseline justify-between gap-2 text-sm">
                      <span className="font-semibold">{tp.title}</span>
                      <span className="text-muted tabular-nums">{v}%</span>
                    </span>
                    <ColourBar
                      value={v}
                      colour={BAR_COLOURS[i % BAR_COLOURS.length]!}
                      label={tp.title + ": " + v + "%"}
                    />
                  </li>
                );
              })}
            </ul>
          </div>
        </Panel>

        <Panel
          className="xl:col-span-5"
          title={t("home.compassTitle")}
          action={{ href: "/explore", label: t("home.exploreWorlds") }}
        >
          <p className="text-sm text-muted">{t("home.compassBody")}</p>
          <div className="flex justify-center">
            <CareerCompass
              initial={learner.firstName.slice(0, 1).toUpperCase()}
              label={t("home.compassAlt")}
              worlds={WORLDS.map((w) => ({
                code: w.code,
                name: tw(w.code),
                score: best.has(w.code) ? best.get(w.code)! : null,
              }))}
            />
          </div>
        </Panel>

        <Panel
          className="xl:col-span-4"
          title={t("home.upNextTitle")}
          action={{ href: "/learn", label: t("home.viewAll") }}
        >
          <ul className="flex flex-col gap-3">
            {upNext.map(({ course: c, topic }) => (
              <li key={c.slug + topic.title}>
                <Link
                  href={"/learn/" + c.slug}
                  className="flex items-center gap-3 rounded-xl border border-border p-3 transition-colors hover:border-primary"
                >
                  <WorldIcon code={c.world ?? "AGR"} size="sm" />
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate text-sm font-semibold">{topic.title}</span>
                    <span className="truncate text-xs text-muted">
                      {t("home.upNextMeta", { course: c.title, n: topic.minutes })}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel className="xl:col-span-4" title={t("home.noticeTitle")}>
          <ul className="flex flex-col gap-3">
            {NOTICES.map((n) => (
              <li key={n.id} className="flex gap-3 rounded-xl border border-border p-3">
                <Bell aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-muted" />
                <span className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold">{n.title}</span>
                  <span className="text-sm text-muted">{n.body}</span>
                </span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel
          className="xl:col-span-4"
          title={t("home.matchTitle")}
          action={{ href: "/opportunities", label: t("home.viewAll") }}
        >
          <Link
            href="/opportunities"
            style={worldStyle(top.world)}
            className="world-tint lift flex flex-1 flex-col items-center gap-3 rounded-2xl p-5 text-center"
          >
            <ScoreRing value={top.score} size={88} label={t("opps.match", { score: top.score })} />
            <span className="font-heading text-lg leading-snug font-semibold">{top.title}</span>
            <span className="text-sm text-muted">{top.sponsor}</span>
            <span className="text-xs font-semibold text-muted">
              {top.type} · {t("home.closes", { date: fmt.format(new Date(top.closes)) })}
            </span>
          </Link>
        </Panel>
      </div>
      <SampleNote>{t("sample")}</SampleNote>
    </section>
  );
}
