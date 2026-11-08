import { getLocale, getTranslations } from "next-intl/server";
import { Card } from "@sgela/ui";
import {
  CalendarClock,
  Check,
  ChevronDown,
  Layers,
  Lock,
  MapPin,
  Plus,
  Star,
  Target,
  Wallet,
} from "lucide-react";
import { PageIntro, StatStrip } from "@/components/dashboard/parts";
import { SampleNote, ScoreRing } from "@/components/demo/ui";
import { worldStyle } from "@/components/demo/world-visuals";
import { requireLearnerPage } from "@/lib/auth/rbac";
import { systemClock } from "@/lib/clock";
import { OPPORTUNITIES } from "@/lib/demo/data";

export async function generateMetadata() {
  const t = await getTranslations("nav");
  return { title: t("opportunities") };
}

/**
 * Opportunities (demo shell for M5). Match cards show score, reasons and gaps. The restricted
 * rule is real: learners waiting for guardian consent see the list but cannot be invited.
 */
export default async function OpportunitiesPage() {
  const { learner } = await requireLearnerPage();
  const t = await getTranslations("demo");
  const locale = await getLocale();
  const fmt = new Intl.DateTimeFormat(locale === "en" ? "en-ZA" : locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const soon = new Date(systemClock().getTime() + 90 * 24 * 60 * 60 * 1000);

  return (
    <section className="mx-auto flex max-w-7xl flex-col gap-6">
      <PageIntro title={t("opps.title")} intro={t("opps.intro")} />
      <StatStrip
        stats={[
          {
            label: t("opps.statMatches"),
            value: String(OPPORTUNITIES.length),
            icon: Target,
            accent: "#ABCF37",
          },
          {
            label: t("opps.statBest"),
            value: String(Math.max(...OPPORTUNITIES.map((o) => o.score))),
            icon: Star,
            accent: "#FFB547",
          },
          {
            label: t("opps.statClosing"),
            value: String(OPPORTUNITIES.filter((o) => new Date(o.closes) < soon).length),
            icon: CalendarClock,
            accent: "#FF6B5A",
          },
          {
            label: t("opps.statTypes"),
            value: String(new Set(OPPORTUNITIES.map((o) => o.type)).size),
            icon: Layers,
            accent: "#4FA3FF",
          },
        ]}
      />
      {learner.restricted ? (
        <Card className="flex flex-col gap-1 border-warning" data-testid="opps-restricted">
          <p className="font-semibold">{t("opps.restrictedTitle")}</p>
          <p className="text-sm">{t("opps.restrictedBody")}</p>
        </Card>
      ) : null}
      <ul className="grid gap-5 lg:grid-cols-2">
        {OPPORTUNITIES.map((o) => (
          <li key={o.id}>
            <article
              style={worldStyle(o.world)}
              className="course-card flex h-full flex-col gap-5 rounded-3xl p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 flex-col gap-2">
                  <span className="text-xs font-semibold tracking-wide text-muted uppercase">
                    {o.type}
                  </span>
                  <h2 className="font-heading text-xl leading-snug font-semibold">{o.title}</h2>
                  <p className="text-sm font-medium text-muted">{o.sponsor}</p>
                </div>
                <ScoreRing value={o.score} size={72} label={t("opps.match", { score: o.score })} />
              </div>
              <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm font-medium text-muted">
                <span className="flex items-center gap-1.5">
                  <Wallet aria-hidden="true" className="size-4" />
                  {o.value}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin aria-hidden="true" className="size-4" />
                  {o.provinces}
                </span>
                <span className="flex items-center gap-1.5">
                  <CalendarClock aria-hidden="true" className="size-4" />
                  {t("opps.closes", { date: fmt.format(new Date(o.closes)) })}
                </span>
              </div>
              <details className="group mt-auto rounded-2xl bg-(--glass) p-4 text-sm">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-2 font-semibold">
                  {t("opps.details")}
                  <ChevronDown
                    aria-hidden="true"
                    className="size-4 transition-transform group-open:rotate-180"
                  />
                </summary>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="mb-1 font-semibold">{t("opps.why")}</p>
                    <ul className="flex flex-col gap-1">
                      {o.reasons.map((r) => (
                        <li key={r} className="flex gap-2">
                          <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="mb-1 font-semibold">{t("opps.gaps")}</p>
                    <ul className="flex flex-col gap-1 text-muted">
                      {o.gaps.map((g) => (
                        <li key={g} className="flex gap-2">
                          <Plus aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                          {g}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </details>
              <p className="flex items-center gap-1.5 text-xs font-medium text-muted">
                <Lock aria-hidden="true" className="size-3.5" />
                {t("opps.demoAction")}
              </p>
            </article>
          </li>
        ))}
      </ul>
      <SampleNote>{t("sample")}</SampleNote>
    </section>
  );
}
