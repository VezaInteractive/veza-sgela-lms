import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { PROVINCES } from "@sgela/geo";
import { Activity, Baby, ShieldCheck, Ticket, Users } from "lucide-react";
import { AdminCard, AdminStatGrid } from "@/components/admin/admin-parts";
import { AdminShell } from "@/components/admin/admin-shell";
import { Funnel } from "@/components/dashboard/funnel";
import { BarList } from "@/components/demo/ui";
import { getCurrentSession } from "@/lib/auth/session";
import type { FUNNEL_STEPS } from "@/lib/insights/service";
import { loadInsights } from "@/lib/insights/service";

export const metadata = { title: "Insights", robots: { index: false } };

/**
 * Admin insights (preview of M7, D-028; premium admin shell D-038). Admin-only; aggregates only;
 * groups under 20 learners are suppressed server-side (MIN_CELL) and never reach this page.
 */
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
  const n = (v: number) => v.toLocaleString("en-ZA");
  const adminName = session.user.learner
    ? [session.user.learner.firstName, session.user.learner.lastName].filter(Boolean).join(" ")
    : "Admin";

  return (
    <AdminShell
      tab="insights"
      adminName={adminName}
      title={t("title")}
      intro={t("introShort")}
      actions={
        <span className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-semibold">
          <ShieldCheck aria-hidden="true" className="size-4 text-link" />
          {t("privacyChip")}
        </span>
      }
    >
      <AdminStatGrid
        stats={[
          { label: t("learners"), value: n(k.learners), icon: Users, accent: "#ABCF37" },
          {
            label: t("minors"),
            value: n(k.minors),
            icon: Baby,
            accent: "#4FA3FF",
            note: pct(k.minors),
          },
          {
            label: t("restricted"),
            value: n(k.restricted),
            icon: ShieldCheck,
            accent: "#3FD1B5",
            note: pct(k.restricted),
          },
          { label: t("claims"), value: n(k.claimed), icon: Ticket, accent: "#FFB547" },
          {
            label: t("sessions"),
            value: n(k.sessions),
            icon: Activity,
            accent: "#FF6B5A",
            note: t("simulatedHint", { n: k.simulatedSessions }),
          },
        ]}
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <AdminCard title={t("funnelTitle")} accent="#ABCF37">
          <p className="-mt-2 text-sm text-muted">{t("funnelNote")}</p>
          <Funnel
            steps={data.funnel.map((f) => ({
              label: t(("steps." + f.step) as `steps.${(typeof FUNNEL_STEPS)[number]}`),
              count: f.count,
            }))}
            ofPrevious={(p) => t("ofPrevious", { pct: p })}
          />
        </AdminCard>

        <div className="flex min-w-0 flex-col gap-6">
          <AdminCard title={t("provinceTitle")} accent="#4FA3FF">
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
          </AdminCard>
          <AdminCard title={t("worldTitle")} accent="#FF6B5A">
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
          </AdminCard>
        </div>
      </div>
    </AdminShell>
  );
}
