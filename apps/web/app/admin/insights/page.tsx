import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { PROVINCES } from "@sgela/geo";
import { Card, CardTitle } from "@sgela/ui";
import { BarList, StatTile } from "@/components/demo/ui";
import { SimpleShellWide } from "@/components/simple-shell";
import { getCurrentSession } from "@/lib/auth/session";
import type { FUNNEL_STEPS } from "@/lib/insights/service";
import { loadInsights } from "@/lib/insights/service";

export const metadata = { title: "Insights", robots: { index: false } };

/** Admin insights (preview of M7). Admin-only, aggregates only, small groups suppressed. */
export default async function InsightsPage() {
  const session = await getCurrentSession();
  if (!session) redirect("/start");
  if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") notFound();

  const t = await getTranslations("demo.insights");
  const tw = await getTranslations("worlds");
  const data = await loadInsights();
  const k = data.kpis;
  const provinceName = (code: string) => PROVINCES.find((p) => p.code === code)?.name ?? code;
  const pct = (n: number) => (k.learners ? Math.round((n / k.learners) * 100) + "%" : "-");

  return (
    <SimpleShellWide>
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-bold md:text-4xl">{t("title")}</h1>
        <p className="text-muted">{t("intro")}</p>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatTile label={t("learners")} value={k.learners.toLocaleString("en-ZA")} />
        <StatTile
          label={t("minors")}
          value={k.minors.toLocaleString("en-ZA")}
          hint={pct(k.minors)}
        />
        <StatTile
          label={t("restricted")}
          value={k.restricted.toLocaleString("en-ZA")}
          hint={pct(k.restricted)}
        />
        <StatTile label={t("claims")} value={k.claimed.toLocaleString("en-ZA")} />
        <StatTile
          label={t("sessions")}
          value={k.sessions.toLocaleString("en-ZA")}
          hint={t("simulatedHint", { n: k.simulatedSessions })}
        />
      </div>
      <Card className="flex flex-col gap-2">
        <CardTitle>{t("funnelTitle")}</CardTitle>
        <p className="text-sm text-muted">{t("funnelNote")}</p>
        <BarList
          caption={t("funnelTitle")}
          valueHeader={t("count")}
          rows={data.funnel.map((f) => ({
            label: t(("steps." + f.step) as `steps.${(typeof FUNNEL_STEPS)[number]}`),
            value: f.count,
          }))}
        />
      </Card>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="flex flex-col gap-2">
          <CardTitle>{t("provinceTitle")}</CardTitle>
          {data.provinces.length === 0 ? (
            <p className="text-sm text-muted">{t("noData")}</p>
          ) : (
            <BarList
              caption={t("provinceTitle")}
              valueHeader={t("count")}
              rows={data.provinces.map((p) => ({
                label: provinceName(p.key),
                value: p.value,
                note: t("suppressed"),
              }))}
            />
          )}
        </Card>
        <Card className="flex flex-col gap-2">
          <CardTitle>{t("worldTitle")}</CardTitle>
          <p className="text-sm text-muted">{t("worldNote")}</p>
          {data.worlds.length === 0 ? (
            <p className="text-sm text-muted">{t("noData")}</p>
          ) : (
            <BarList
              caption={t("worldTitle")}
              valueHeader={t("count")}
              rows={data.worlds.map((w) => ({
                label: tw(w.key as "AVI"),
                value: w.value,
                note: t("suppressed"),
              }))}
            />
          )}
        </Card>
      </div>
    </SimpleShellWide>
  );
}
