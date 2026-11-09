import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { Award, Bell, CheckCircle2, Flame, Star } from "lucide-react";
import { getDb } from "@sgela/db";
import { getDistrict, PROVINCES } from "@sgela/geo";
import { MonthCalendar } from "@/components/dashboard/calendar";
import { ColourBar, HeroStats, PageIntro, Panel, ProgressRing } from "@/components/dashboard/parts";
import { ProfileCard } from "@/components/dashboard/profile-card";
import { SampleNote, ScoreRing } from "@/components/demo/ui";
import {
  CareerCompass,
  WORLD_COLOURS,
  WorldIcon,
  worldStyle,
} from "@/components/demo/world-visuals";
import { requireLearnerPage } from "@/lib/auth/rbac";
import { linkedResults } from "@/lib/claim/service";
import { systemClock } from "@/lib/clock";
import {
  BADGES,
  COURSES,
  EVENTS,
  LEARNER_STATS,
  NOTICES,
  OPPORTUNITIES,
  WORLDS,
} from "@/lib/demo/data";
import { avatarUrlFor } from "@/lib/profile/avatar";

export async function generateMetadata() {
  const t = await getTranslations("nav");
  return { title: t("home") };
}

/** Topic bar colours, cycled (decorative; each bar has its topic name and % in text). */
const BAR_COLOURS = ["#4FA3FF", "#FFB547", "#FF6B5A", "#3FD1B5", "#ABCF37", "#9B7BFF"];
const TOPIC_PROGRESS = { done: 100, current: 35, locked: 0 } as const;

/** Today in South Africa as YYYY-MM-DD. */
function todayInSa() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Johannesburg" }).format(
    systemClock(),
  );
}

/**
 * Learner dashboard (D-021/D-025). Header with big numbers; then three columns on desktop:
 * profile + up next | course progress + calendar | compass + match + notices. Profile facts,
 * photo and Career Compass are real; the rest is sample content until M2-M5 (D-018).
 */
export default async function HomePage({ searchParams }: PageProps<"/home">) {
  const { learner } = await requireLearnerPage();
  const t = await getTranslations("demo");
  const tw = await getTranslations("worlds");
  const locale = await getLocale();
  const intlLocale = locale === "en" ? "en-ZA" : locale;
  const fmt = new Intl.DateTimeFormat(intlLocale, { day: "numeric", month: "short" });

  const [results, school] = await Promise.all([
    linkedResults(learner.id),
    learner.schoolId
      ? getDb().school.findUnique({ where: { id: learner.schoolId }, select: { name: true } })
      : null,
  ]);
  const best = new Map<string, number>();
  for (const r of results) best.set(r.worldCode, Math.max(best.get(r.worldCode) ?? 0, r.score));
  const focus = [...WORLDS].sort((a, b) => (best.get(b.code) ?? -1) - (best.get(a.code) ?? -1))[0]!;

  const s = LEARNER_STATS;
  const course = COURSES.find((c) => c.progress > 0) ?? COURSES[0]!;
  const courseColour = WORLD_COLOURS[course.world ?? "READY"]!;
  const upNext = COURSES.flatMap((c) =>
    c.topics.filter((tp) => tp.status === "current").map((tp) => ({ course: c, topic: tp })),
  ).slice(0, 3);
  const top = OPPORTUNITIES[0]!;
  const topicsDone = COURSES.flatMap((c) => c.topics).filter((tp) => tp.status === "done").length;

  // Calendar month: ?month=YYYY-MM, else this month (South African time).
  const today = todayInSa();
  const { month: monthParam } = await searchParams;
  const ym =
    typeof monthParam === "string" && /^\d{4}-(0[1-9]|1[0-2])$/.test(monthParam)
      ? monthParam
      : today.slice(0, 7);
  const [calYear, calMonth] = [Number(ym.slice(0, 4)), Number(ym.slice(5, 7)) - 1];

  const name = [learner.firstName, learner.lastName].filter(Boolean).join(" ");
  const district = getDistrict(learner.districtCode)?.name;
  const province = PROVINCES.find((p) => p.code === learner.provinceCode)?.name;
  const schoolName = school?.name ?? learner.schoolNameFree ?? undefined;
  const gradeLabel =
    learner.inSchool && learner.grade
      ? t("home.gradeValue", { grade: learner.grade })
      : learner.inSchool
        ? undefined
        : t("home.notInSchool");

  return (
    <section className="mx-auto flex max-w-7xl flex-col gap-6">
      <div className="hero-band fade-up rounded-3xl p-6 md:p-8">
        <span aria-hidden="true" className="hero-orb hero-orb-a" />
        <span aria-hidden="true" className="hero-orb hero-orb-b" />
        <PageIntro
          title={t("home.welcome", { name: learner.firstName })}
          intro={t("home.welcomeBody")}
        >
          <HeroStats
            stats={[
              {
                label: t("home.statStreak"),
                value: String(s.streakDays),
                icon: Flame,
                accent: "#FF6B5A",
              },
              {
                label: t("home.statTopics"),
                value: String(topicsDone),
                icon: CheckCircle2,
                accent: "#4FA3FF",
              },
              {
                label: t("home.statBadges"),
                value: String(BADGES.filter((b) => b.earned).length),
                icon: Award,
                accent: "#9B7BFF",
              },
              {
                label: t("home.statBestScore"),
                value: best.size ? String(Math.max(...best.values())) : "-",
                icon: Star,
                accent: "#FFB547",
              },
            ]}
          />
        </PageIntro>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-[18rem_minmax(0,1fr)_20rem]">
        {/* Column 1: who you are + what to do next */}
        <div className="fade-up flex min-w-0 flex-col gap-6 [animation-delay:80ms]">
          <ProfileCard
            name={name}
            photoUrl={avatarUrlFor(learner)}
            subtitle={[gradeLabel, schoolName].filter(Boolean).join(" · ") || undefined}
            place={[district, province].filter(Boolean).join(", ") || undefined}
            level={t("home.levelValue", { level: s.level })}
            xpLabel={t("home.xpToNext", { xp: s.xp, next: s.nextLevelXp, level: s.level + 1 })}
            xpPct={Math.round((s.xp / s.nextLevelXp) * 100)}
            editLabel={t("home.editProfile")}
            editHref="/me"
          />
          <Panel
            title={t("home.upNextTitle")}
            accent="#9B7BFF"
            action={{ href: "/learn", label: t("home.viewAll") }}
          >
            <ul className="flex flex-col gap-3">
              {upNext.map(({ course: c, topic }) => (
                <li key={c.slug + topic.title}>
                  <Link
                    href={"/learn/" + c.slug}
                    className="flex items-center gap-3 rounded-xl border border-border p-3 transition-colors hover:border-primary"
                  >
                    <WorldIcon code={c.world ?? "READY"} size="sm" />
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
        </div>

        {/* Column 2: learning progress + calendar */}
        <div className="fade-up flex min-w-0 flex-col gap-6 [animation-delay:160ms]">
          <Panel
            title={t("home.progressTitle", { course: course.title })}
            accent={courseColour}
            action={{ href: "/learn/" + course.slug, label: t("learn.continue") }}
          >
            <div className="flex flex-col items-center gap-6 2xl:flex-row">
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
                        delay={350 + i * 120}
                        label={tp.title + ": " + v + "%"}
                      />
                    </li>
                  );
                })}
              </ul>
            </div>
          </Panel>
          <MonthCalendar
            year={calYear}
            month={calMonth}
            today={today}
            locale={intlLocale}
            events={EVENTS.map((e) => ({
              id: e.id,
              date: e.date,
              title: e.title,
              colour: WORLD_COLOURS[e.world]!,
            }))}
            labels={{
              title: t("home.calendarTitle"),
              prev: t("home.calendarPrev"),
              next: t("home.calendarNext"),
              comingUp: t("home.calendarComingUp"),
              none: t("home.calendarNone"),
              today: t("home.calendarToday"),
              eventsOn: (n) => t("home.calendarEvents", { n }),
            }}
            hrefFor={(m) => "/home?month=" + m}
          />
        </div>

        {/* Column 3: where you fit */}
        <div className="fade-up flex min-w-0 flex-col gap-6 [animation-delay:240ms] md:col-span-2 md:grid md:grid-cols-2 xl:col-span-1 xl:flex">
          <Panel
            title={t("home.compassTitle")}
            accent="#ABCF37"
            action={{
              href: "/explore/" + focus.code.toLowerCase(),
              label: t("explore.open", { world: tw(focus.code) }),
            }}
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
            title={t("home.matchTitle")}
            accent={WORLD_COLOURS[top.world]}
            action={{ href: "/opportunities", label: t("home.viewAll") }}
          >
            <Link
              href="/opportunities"
              style={worldStyle(top.world)}
              className="world-tint lift flex flex-1 flex-col items-center justify-center gap-3 rounded-2xl p-5 text-center"
            >
              <ScoreRing
                value={top.score}
                size={80}
                label={t("opps.match", { score: top.score })}
              />
              <span className="font-heading text-lg leading-snug font-semibold">{top.title}</span>
              <span className="text-sm text-muted">{top.sponsor}</span>
              <span className="text-xs font-semibold text-muted">
                {top.type} · {t("home.closes", { date: fmt.format(new Date(top.closes)) })}
              </span>
            </Link>
          </Panel>

          <Panel
            id="notices"
            accent="#FF6B5A"
            title={t("home.noticeTitle")}
            className="md:col-span-2 xl:col-span-1"
          >
            <ul className="flex flex-col gap-3">
              {NOTICES.map((n, i) => (
                <li key={n.id} className="flex gap-3 rounded-xl border border-border p-3">
                  <Bell
                    aria-hidden="true"
                    className={"mt-0.5 size-4 shrink-0 text-muted" + (i === 0 ? " bell-ring" : "")}
                  />
                  <span className="flex flex-col gap-0.5">
                    <span className="text-sm font-semibold">{n.title}</span>
                    <span className="text-sm text-muted">{n.body}</span>
                  </span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
      <SampleNote>{t("sample")}</SampleNote>
    </section>
  );
}
