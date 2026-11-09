import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { PROVINCES } from "@sgela/geo";
import { Activity, Baby, LogOut, ShieldCheck, Ticket, Users } from "lucide-react";
import { Button } from "@sgela/ui";
import { signOutAction } from "@/app/(auth)/start/actions";
import { Funnel } from "@/components/dashboard/funnel";
import { HeroStats, PageIntro, Panel } from "@/components/dashboard/parts";
import { BarList } from "@/components/demo/ui";
import { SimpleShellWide } from "@/components/simple-shell";
import { getCurrentSession } from "@/lib/auth/session";
import type { FUNNEL_STEPS } from "@/lib/insights/service";
import { loadInsights } from "@/lib/insights/service";

export const metadata = { title: "Insights", robots: { index: false } };

/**
 * Admin insights (preview of M7, D-028). Admin-only; aggregates only; groups under 20 learners
 * are suppressed server-side (MIN_CELL) and never reach this page.
 */
export default async function InsightsPage() {
  const session = await getCurrentSession();
  if (!session) redirect("/start");
  if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") notFound();

  const t = await getTranslations("demo.insights");
  const tw = await getTranslations("worlds");
  const tc = await getTranslations("common");
  const tcat = await getTranslations("admin.careers");
  const data = await loadInsights();
  const k = data.kpis;
  const provinceName = (code: string) => PROVINCES.find((p) => p.code === code)?.name ?? code;
  const pct = (n: number) => (k.learners ? Math.round((n / k.learners) * 100) + "%" : "-");
  const n = (v: number) => v.toLocaleString("en-ZA");

  return (
    <SimpleShellWide>
      <PageIntro title={t("title")} intro={t("introShort")}>
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-semibold">
            <ShieldCheck aria-hidden="true" className="size-4 text-link" />
            {t("privacyChip")}
          </span>
          <a
            href="/admin/careers"
            className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-semibold hover:border-primary"
          >
            {tcat("navCatalog")}
          </a>
          <form action={signOutAction}>
            <Button type="submit" variant="secondary" size="sm">
              <LogOut className="size-4" aria-hidden="true" />
              {tc("signOut")}
            </Button>
          </form>
        </div>
      </PageIntro>

      <div className="glass rounded-2xl p-5 md:p-6">
        <HeroStats
          stats={[
            { label: t("learners"), value: n(k.learners), icon: Users, accent: "#ABCF37" },
            {
              label: t("minors") + " · " + pct(k.minors),
              value: n(k.minors),
              icon: Baby,
              accent: "#4FA3FF",
            },
            {
              label: t("restricted") + " · " + pct(k.restricted),
              value: n(k.restricted),
              icon: ShieldCheck,
              accent: "#3FD1B5",
            },
            { label: t("claims"), value: n(k.claimed), icon: Ticket, accent: "#FFB547" },
            {
              label: t("sessions") + " · " + t("simulatedHint", { n: k.simulatedSessions }),
              value: n(k.sessions),
              icon: Activity,
              accent: "#FF6B5A",
            },
          ]}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <Panel title={t("funnelTitle")}>
          <p className="-mt-2 text-sm text-muted">{t("funnelNote")}</p>
          <Funnel
            steps={data.funnel.map((f) => ({
              label: t(("steps." + f.step) as `steps.${(typeof FUNNEL_STEPS)[number]}`),
              count: f.count,
            }))}
            ofPrevious={(p) => t("ofPrevious", { pct: p })}
          />
        </Panel>

        <div className="flex min-w-0 flex-col gap-6">
          <Panel title={t("provinceTitle")}>
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
          </Panel>
          <Panel title={t("worldTitle")}>
            <p className="-mt-2 text-sm text-muted">{t("worldNote")}</p>
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
          </Panel>
        </div>
      </div>
    </SimpleShellWide>
  );
}
