import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowRight, Flame, Sparkles, Trophy } from "lucide-react";
import { Button } from "@sgela/ui";
import { ProgressBar, SampleNote, ScoreRing } from "@/components/demo/ui";
import { CareerCompass, WorldIcon, worldStyle } from "@/components/demo/world-visuals";
import { requireLearnerPage } from "@/lib/auth/rbac";
import { linkedResults } from "@/lib/claim/service";
import { COURSES, LEARNER_STATS, OPPORTUNITIES, WORLDS } from "@/lib/demo/data";

export async function generateMetadata() {
  const t = await getTranslations("nav");
  return { title: t("home") };
}

/**
 * Career Compass (demo shell for M2). Compass and world scores come from the learner's real
 * linked expo results; XP, next step, courses and the top match are sample content (D-018).
 */
export default async function HomePage() {
  const { learner } = await requireLearnerPage();
  const t = await getTranslations("demo");
  const tw = await getTranslations("worlds");
  const results = await linkedResults(learner.id);
  const best = new Map<string, number>();
  for (const r of results) best.set(r.worldCode, Math.max(best.get(r.worldCode) ?? 0, r.score));
  const ranked = [...WORLDS].sort((a, b) => (best.get(b.code) ?? -1) - (best.get(a.code) ?? -1));
  const focus = ranked[0]!;
  const course = COURSES.find((c) => c.progress > 0) ?? COURSES[0]!;
  const top = OPPORTUNITIES[0]!;
  const s = LEARNER_STATS;
  const xpPct = Math.round((s.xp / s.nextLevelXp) * 100);

  return (
    <section className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="glass fade-up grid items-center gap-8 overflow-hidden rounded-3xl p-6 md:p-10 xl:grid-cols-[1.1fr_1fr]">
        <div className="flex flex-col gap-5">
          <p className="flex items-center gap-2 text-sm font-semibold text-muted">
            <Sparkles className="size-4 text-primary" aria-hidden="true" />
            {t("home.compassLabel")}
          </p>
          <h1 className="font-heading text-4xl leading-tight font-bold md:text-5xl">
            {t("home.greeting", { name: learner.firstName })}
            <br />
            <span className="text-gradient">{t("home.heroLine")}</span>
          </h1>
          <div className="flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary px-3 py-1.5 text-sm font-bold text-primary-foreground">
              <Trophy className="size-4" aria-hidden="true" />
              {t("home.level", { level: s.level })}
            </span>
            <span className="glass inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold">
              <Flame className="size-4 text-[#FF6B5A]" aria-hidden="true" />
              {t("home.streak", { days: s.streakDays })}
            </span>
          </div>
          <div className="flex max-w-sm flex-col gap-1.5">
            <ProgressBar value={xpPct} label={t("home.xp", { xp: s.xp, next: s.nextLevelXp })} />
            <span className="text-xs text-muted">
              {t("home.xp", { xp: s.xp, next: s.nextLevelXp })}
            </span>
          </div>
          <div
            style={worldStyle(focus.code)}
            className="world-tint flex flex-col gap-3 rounded-2xl p-5 sm:flex-row sm:items-center"
          >
            <WorldIcon code={focus.code} size="lg" />
            <div className="flex flex-1 flex-col">
              <span className="text-xs font-semibold tracking-wide text-muted uppercase">
                {t("home.nextTitle")}
              </span>
              <span className="font-heading text-lg font-semibold">
                {t("home.nextBody", { world: tw(focus.code) })}
              </span>
            </div>
            <Button asChild>
              <Link href={"/explore/" + focus.code.toLowerCase()}>
                {t("home.nextCta")}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
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
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-heading text-2xl font-semibold">{t("home.worldsTitle")}</h2>
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {ranked.map((w) => {
            const score = best.get(w.code);
            return (
              <li key={w.code}>
                <Link
                  href={"/explore/" + w.code.toLowerCase()}
                  style={worldStyle(w.code)}
                  className="world-tint lift flex h-full flex-col gap-4 rounded-2xl p-5"
                >
                  <span className="flex items-start justify-between">
                    <WorldIcon code={w.code} />
                    {score !== undefined ? (
                      <span className="font-heading text-3xl font-bold tabular-nums">{score}</span>
                    ) : null}
                  </span>
                  <span className="flex flex-col">
                    <span className="font-heading text-lg font-semibold">{tw(w.code)}</span>
                    <span className="text-xs text-muted">
                      {score !== undefined ? t("home.fromExpo", { score }) : t("home.notPlayed")}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Link
          href={"/learn/" + course.slug}
          style={worldStyle(course.world ?? "AGR")}
          className="world-tint lift flex flex-col gap-4 rounded-2xl p-6"
        >
          <span className="flex items-center gap-3">
            <WorldIcon code={course.world ?? "AGR"} />
            <span className="flex flex-col">
              <span className="text-xs font-semibold tracking-wide text-muted uppercase">
                {t("home.continueTitle")}
              </span>
              <span className="font-heading text-lg font-semibold">{course.title}</span>
            </span>
          </span>
          <ProgressBar value={course.progress} label={course.title} />
          <span className="flex items-center gap-1 text-sm font-semibold text-link">
            {t("learn.continue")} <ArrowRight className="size-4" aria-hidden="true" />
          </span>
        </Link>
        <Link
          href="/opportunities"
          style={worldStyle(top.world)}
          className="world-tint lift flex items-center gap-5 rounded-2xl p-6"
        >
          <ScoreRing value={top.score} size={76} label={t("opps.match", { score: top.score })} />
          <span className="flex flex-col gap-1">
            <span className="text-xs font-semibold tracking-wide text-muted uppercase">
              {t("home.topMatch")}
            </span>
            <span className="font-heading text-lg font-semibold">{top.title}</span>
            <span className="text-sm text-muted">{top.sponsor}</span>
          </span>
        </Link>
      </div>
      <SampleNote>{t("sample")}</SampleNote>
    </section>
  );
}
