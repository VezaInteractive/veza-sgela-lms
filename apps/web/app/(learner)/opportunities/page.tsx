import { getLocale, getTranslations } from "next-intl/server";
import { Badge, Button, Card } from "@sgela/ui";
import { CalendarClock, Layers, Star, Target } from "lucide-react";
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
            <Card
              style={worldStyle(o.world)}
              className="course-card flex h-full flex-col gap-4 rounded-2xl"
            >
              <div className="flex items-start gap-4">
                <ScoreRing value={o.score} label={t("opps.match", { score: o.score })} />
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="flex flex-wrap items-center gap-2 text-xs">
                    <Badge tone={o.world}>{o.world}</Badge>
                    <Badge tone="neutral">{o.type}</Badge>
                  </span>
                  <h2 className="font-heading text-lg font-semibold">{o.title}</h2>
                  <p className="text-sm text-muted">
                    {o.sponsor} · {o.provinces}
                  </p>
                  <p className="text-sm">{o.value}</p>
                  <p className="text-xs text-muted">
                    {t("opps.closes", { date: fmt.format(new Date(o.closes)) })}
                  </p>
                </div>
              </div>
              <div className="grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <p className="mb-1 font-semibold">{t("opps.why")}</p>
                  <ul className="flex flex-col gap-1">
                    {o.reasons.map((r) => (
                      <li key={r} className="flex gap-2">
                        <span aria-hidden="true" className="text-primary">
                          ✓
                        </span>
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
                        <span aria-hidden="true">+</span>
                        {g}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button disabled title={t("opps.demoAction")}>
                  {t("opps.accept")}
                </Button>
                <Button variant="secondary" disabled title={t("opps.demoAction")}>
                  {t("opps.save")}
                </Button>
                <span className="text-xs text-muted">{t("opps.demoAction")}</span>
              </div>
            </Card>
          </li>
        ))}
      </ul>
      <SampleNote>{t("sample")}</SampleNote>
    </section>
  );
}
