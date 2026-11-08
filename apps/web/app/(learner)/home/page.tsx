import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Badge, Button, Card, CardTitle } from "@sgela/ui";
import { ProgressBar, SampleNote, ScoreRing } from "@/components/demo/ui";
import { requireLearnerPage } from "@/lib/auth/rbac";
import { linkedResults } from "@/lib/claim/service";
import { COURSES, LEARNER_STATS, OPPORTUNITIES, WORLDS } from "@/lib/demo/data";

export async function generateMetadata() {
  const t = await getTranslations("nav");
  return { title: t("home") };
}

/**
 * Career Compass (demo shell for M2). Worlds and scores come from the learner real linked
 * expo results; XP, next step, courses and the top match are sample content (D-018).
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

  return (
    <section className="mx-auto flex max-w-5xl flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-bold md:text-4xl">
          {t("home.greeting", { name: learner.firstName })}
        </h1>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <Badge tone="lime">{t("home.level", { level: s.level })}</Badge>
          <span className="text-muted">{t("home.xp", { xp: s.xp, next: s.nextLevelXp })}</span>
          <span className="text-muted">·</span>
          <span className="text-muted">{t("home.streak", { days: s.streakDays })}</span>
        </div>
        <div className="max-w-xs">
          <ProgressBar
            value={Math.round((s.xp / s.nextLevelXp) * 100)}
            label={t("home.xp", { xp: s.xp, next: s.nextLevelXp })}
          />
        </div>
      </div>

      <Card className="flex flex-col gap-3 border-primary">
        <span className="text-sm font-semibold text-muted">{t("home.nextTitle")}</span>
        <p className="font-heading text-xl font-semibold">
          {t("home.nextBody", { world: tw(focus.code) })}
        </p>
        <Button asChild className="self-start">
          <Link href={"/explore/" + focus.code.toLowerCase()}>{t("home.nextCta")}</Link>
        </Button>
      </Card>

      <div className="flex flex-col gap-3">
        <h2 className="font-heading text-xl font-semibold">{t("home.worldsTitle")}</h2>
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
          {ranked.map((w) => {
            const score = best.get(w.code);
            return (
              <li key={w.code}>
                <Link
                  href={"/explore/" + w.code.toLowerCase()}
                  className="flex h-full items-center gap-3 rounded-lg border border-border bg-surface p-4 transition-colors hover:border-primary"
                >
                  <ScoreRing
                    value={score ?? 0}
                    size={56}
                    label={
                      score !== undefined ? t("home.fromExpo", { score }) : t("home.notPlayed")
                    }
                  />
                  <span className="flex flex-col">
                    <span className="flex items-center gap-2 font-semibold">
                      <Badge tone={w.code}>{w.code}</Badge>
                      {tw(w.code)}
                    </span>
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
        <Card className="flex flex-col gap-3">
          <CardTitle>{t("home.continueTitle")}</CardTitle>
          <p className="font-semibold">{course.title}</p>
          <ProgressBar value={course.progress} label={course.title} />
          <Link href={"/learn/" + course.slug} className="text-sm text-link underline">
            {t("learn.continue")}
          </Link>
        </Card>
        <Card className="flex items-start gap-4">
          <ScoreRing value={top.score} label={t("opps.match", { score: top.score })} />
          <div className="flex flex-col gap-1">
            <span className="text-sm text-muted">{t("home.topMatch")}</span>
            <p className="font-semibold">{top.title}</p>
            <p className="text-sm text-muted">{top.sponsor}</p>
            <Link href="/opportunities" className="text-sm text-link underline">
              {t("home.seeAll")}
            </Link>
          </div>
        </Card>
      </div>
      <SampleNote>{t("sample")}</SampleNote>
    </section>
  );
}
