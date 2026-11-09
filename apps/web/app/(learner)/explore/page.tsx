import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { ArrowRight, Briefcase, Compass, Gamepad2, Heart, Star } from "lucide-react";
import { CardPhoto, PageIntro, StatStrip } from "@/components/dashboard/parts";
import { WorldIcon, worldStyle } from "@/components/demo/world-visuals";
import { requireLearnerPage } from "@/lib/auth/rbac";
import { linkedResults } from "@/lib/claim/service";
import { wantsLessData } from "@/lib/data-saver";
import { worldPhoto } from "@/lib/demo/photos";
import { listWorlds } from "@/lib/explore/catalog";
import { loadInterestSummary } from "@/lib/interest/service";

export async function generateMetadata() {
  const t = await getTranslations("nav");
  return { title: t("explore") };
}

/**
 * Explore index (L-EX-1, M2-4; D-021 card layout). Worlds, careers and sponsors come from the
 * DB; expo scores and interest are the learner's own.
 */
export default async function ExplorePage() {
  const { learner } = await requireLearnerPage();
  const t = await getTranslations("demo");
  const te = await getTranslations("explore");
  const tw = await getTranslations("worlds");
  const locale = await getLocale();
  const worlds = await listWorlds(locale);
  const [results, interest, saveData] = await Promise.all([
    linkedResults(learner.id),
    loadInterestSummary(
      learner.id,
      worlds.map((w) => w.code),
    ),
    wantsLessData(),
  ]);
  const lessData = saveData || learner.dataSaver;
  const best = new Map<string, number>();
  for (const r of results) best.set(r.worldCode, Math.max(best.get(r.worldCode) ?? 0, r.score));
  const top = Math.max(0, ...best.values());
  return (
    <section className="mx-auto flex max-w-7xl flex-col gap-6">
      <PageIntro title={t("explore.title")} intro={t("explore.intro")} />
      <StatStrip
        stats={[
          {
            label: t("explore.statWorlds"),
            value: String(worlds.length),
            icon: Compass,
            accent: "#ABCF37",
          },
          {
            label: t("explore.statPlayed"),
            value: String(best.size),
            icon: Gamepad2,
            accent: "#4FA3FF",
          },
          {
            label: t("explore.statCareers"),
            value: String(worlds.reduce((n, w) => n + w.careerCount, 0)),
            icon: Briefcase,
            accent: "#FFB547",
          },
          {
            label: t("explore.statBest"),
            value: best.size ? String(top) : "-",
            icon: Star,
            accent: "#FF6B5A",
          },
        ]}
      />
      <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {worlds.map((w) => {
          const score = best.get(w.code);
          const fit = interest.scores[w.code] ?? 0;
          return (
            <li key={w.code}>
              <Link
                href={"/explore/" + w.code.toLowerCase()}
                style={worldStyle(w.code)}
                className="course-card lift group flex h-full flex-col overflow-hidden rounded-3xl"
              >
                {!lessData && worldPhoto(w.code) ? <CardPhoto src={worldPhoto(w.code)!} /> : null}
                <span className="flex flex-1 flex-col gap-4 p-6">
                  <span className="flex items-start justify-between gap-3">
                    <WorldIcon
                      code={w.code}
                      size="lg"
                      className={
                        "course-card-icon" +
                        (lessData ? "" : " relative z-10 -mt-14 ring-4 ring-(--card-ring)")
                      }
                    />
                    <span className="text-right">
                      <span className="block font-heading text-3xl font-bold tabular-nums">
                        {score ?? "-"}
                      </span>
                      <span className="text-xs text-muted">
                        {score !== undefined ? t("home.fromExpo", { score }) : t("home.notPlayed")}
                      </span>
                    </span>
                  </span>
                  <span className="font-heading text-2xl font-semibold">{tw(w.code)}</span>
                  <span className="text-sm text-muted">{w.tagline}</span>
                  {w.sponsor ? (
                    <span className="text-xs font-semibold text-muted">
                      {te("presentedBy", { world: tw(w.code), sponsor: w.sponsor })}
                    </span>
                  ) : null}
                  <span className="mt-auto flex items-center justify-between gap-3 text-sm font-semibold">
                    <span className="flex items-center gap-1">
                      {te("careerCount", { count: w.careerCount })}
                      <ArrowRight
                        className="size-4 transition-transform group-hover:translate-x-1"
                        aria-hidden="true"
                      />
                    </span>
                    {fit > 0 ? (
                      <span className="flex items-center gap-1 rounded-full bg-(--glass) px-2.5 py-1 text-xs">
                        <Heart aria-hidden="true" className="size-3.5" />
                        {te("interestBadge", { n: fit })}
                      </span>
                    ) : null}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
