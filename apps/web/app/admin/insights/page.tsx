import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { PROVINCES } from "@sgela/geo";
import { Activity, BarChart3, Baby, LogOut, ShieldCheck, Ticket, Users } from "lucide-react";
import { Button, CardTitle } from "@sgela/ui";
import { signOutAction } from "@/app/(auth)/start/actions";
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
  const tc = await getTranslations("common");
  const data = await loadInsights();
  const k = data.kpis;
  const provinceName = (code: string) => PROVINCES.find((p) => p.code === code)?.name ?? code;
  const pct = (n: number) => (k.learners ? Math.round((n / k.learners) * 100) + "%" : "-");

  return (
    <SimpleShellWide>
      <div className="glass fade-up flex flex-col gap-5 rounded-3xl p-6 md:flex-row md:items-center md:p-8">
        <span
          aria-hidden="true"
          className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-[0_0_32px_-6px_var(--primary)]"
        >
          <BarChart3 className="size-7" />
        </span>
        <div className="flex flex-1 flex-col gap-1">
          <h1 className="font-heading text-3xl font-bold md:text-4xl">
            <span className="text-gradient">{t("title")}</span>
          </h1>
          <p className="max-w-2xl text-muted">{t("intro")}</p>
        </div>
        <form action={signOutAction} className="self-start md:self-center">
          <Button type="submit" variant="secondary" size="sm">
            <LogOut className="size-4" aria-hidden="true" />
            {tc("signOut")}
          </Button>
        </form>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatTile icon={Users} label={t("learners")} value={k.learners.toLocaleString("en-ZA")} />
        <StatTile
          icon={Baby}
          accent="#4FA3FF"
          label={t("minors")}
          value={k.minors.toLocaleString("en-ZA")}
          hint={pct(k.minors)}
        />
        <StatTile
          icon={ShieldCheck}
          accent="#3FD1B5"
          label={t("restricted")}
          value={k.restricted.toLocaleString("en-ZA")}
          hint={pct(k.restricted)}
        />
        <StatTile
          icon={Ticket}
          accent="#FFB547"
          label={t("claims")}
          value={k.claimed.toLocaleString("en-ZA")}
        />
        <StatTile
          icon={Activity}
          accent="#FF6B5A"
          label={t("sessions")}
          value={k.sessions.toLocaleString("en-ZA")}
          hint={t("simulatedHint", { n: k.simulatedSessions })}
        />
      </div>
      <section className="glass flex flex-col gap-2 rounded-3xl p-5 md:p-6">
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
      </section>
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="glass flex flex-col gap-2 rounded-3xl p-5 md:p-6">
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
        </section>
        <section className="glass flex flex-col gap-2 rounded-3xl p-5 md:p-6">
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
        </section>
      </div>
    </SimpleShellWide>
  );
}
