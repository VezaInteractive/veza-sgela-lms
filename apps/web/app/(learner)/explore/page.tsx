import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowRight, Briefcase, Compass, Gamepad2, Star } from "lucide-react";
import { PageIntro, StatStrip } from "@/components/dashboard/parts";
import { SampleNote } from "@/components/demo/ui";
import { WorldIcon, worldStyle } from "@/components/demo/world-visuals";
import { requireLearnerPage } from "@/lib/auth/rbac";
import { linkedResults } from "@/lib/claim/service";
import { WORLDS } from "@/lib/demo/data";

export async function generateMetadata() {
  const t = await getTranslations("nav");
  return { title: t("explore") };
}

/** Explore index (demo shell for M2-4; D-021 card layout). Expo scores are real. */
export default async function ExplorePage() {
  const { learner } = await requireLearnerPage();
  const t = await getTranslations("demo");
  const tw = await getTranslations("worlds");
  const results = await linkedResults(learner.id);
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
            value: String(WORLDS.length),
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
            value: String(WORLDS.reduce((n, w) => n + w.careers.length, 0)),
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
        {WORLDS.map((w) => {
          const score = best.get(w.code);
          return (
            <li key={w.code}>
              <Link
                href={"/explore/" + w.code.toLowerCase()}
                style={worldStyle(w.code)}
                className="course-card lift group flex h-full flex-col gap-4 rounded-2xl p-6"
              >
                <span className="flex items-start justify-between gap-3">
                  <WorldIcon code={w.code} size="lg" className="course-card-icon" />
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
                <span className="mt-auto flex items-center gap-1 text-sm font-semibold">
                  {t("explore.careerCount", { count: w.careers.length })}
                  <ArrowRight
                    className="size-4 transition-transform group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
      <SampleNote>{t("sample")}</SampleNote>
    </section>
  );
}
