import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowUpRight, ChartNoAxesColumn, LayoutGrid, LogOut, ShieldCheck } from "lucide-react";
import { signOutAction } from "@/app/(auth)/start/actions";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";

export type AdminTab = "insights" | "careers";

/** One nav row in the dark admin sidebar. */
function NavLink({
  href,
  label,
  active,
  Icon,
}: {
  href: string;
  label: string;
  active: boolean;
  Icon: typeof ChartNoAxesColumn;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={
        "group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors " +
        (active
          ? "bg-lime-500 text-ink shadow-[0_8px_20px_-10px_rgba(171,207,55,0.8)]"
          : "text-white/70 hover:bg-white/10 hover:text-white")
      }
    >
      <Icon aria-hidden="true" className="size-5 shrink-0" />
      {label}
    </Link>
  );
}

/**
 * Premium admin chrome: a deep-space sidebar (brand mark, grouped nav, admin identity) with a
 * header band over the content. Mobile shows the brand bar plus a horizontal nav. Server
 * component; the active tab is passed in, so no client JS is needed for highlighting.
 */
export async function AdminShell({
  tab,
  title,
  intro,
  adminName,
  actions,
  children,
}: {
  tab: AdminTab;
  title: string;
  intro?: string;
  adminName: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  const t = await getTranslations("admin.shell");
  const tc = await getTranslations("common");
  const items = [
    {
      key: "insights" as const,
      href: "/admin/insights",
      label: t("navInsights"),
      Icon: ChartNoAxesColumn,
    },
    { key: "careers" as const, href: "/admin/careers", label: t("navCatalog"), Icon: LayoutGrid },
  ];
  const initials =
    adminName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]!.toUpperCase())
      .join("") || "A";

  const nav = items.map((it) => (
    <NavLink key={it.key} href={it.href} label={it.label} active={it.key === tab} Icon={it.Icon} />
  ));

  return (
    <div className="min-h-dvh bg-surface md:grid md:grid-cols-[17rem_minmax(0,1fr)]">
      <a
        href="#admin-main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        {tc("skipToContent")}
      </a>

      {/* Sidebar (desktop) */}
      <aside className="admin-sidebar sticky top-0 hidden h-dvh flex-col gap-6 p-5 text-white md:flex">
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="flex size-11 items-center justify-center rounded-2xl bg-lime-500 text-ink shadow-[0_10px_24px_-10px_rgba(171,207,55,0.9)]"
          >
            <ShieldCheck className="size-6" />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="font-heading text-lg font-bold">{t("brand")}</span>
            <span className="text-xs text-white/60">{t("brandSub")}</span>
          </span>
        </div>

        <nav aria-label={t("menu")} className="flex flex-1 flex-col gap-1.5">
          <span className="px-3.5 pt-1 pb-1 text-[11px] font-semibold tracking-wider text-white/40 uppercase">
            {t("sectionData")}
          </span>
          {nav}
          <Link
            href="/home"
            className="mt-auto flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            <ArrowUpRight aria-hidden="true" className="size-5 shrink-0" />
            {t("backToApp")}
          </Link>
        </nav>

        <div className="flex items-center gap-3 rounded-2xl bg-white/5 p-3">
          <span
            aria-hidden="true"
            className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-lime-500 font-heading text-sm font-bold text-ink"
          >
            {initials}
          </span>
          <span className="flex min-w-0 flex-col leading-tight">
            <span className="truncate text-sm font-semibold">{adminName}</span>
            <span className="text-xs text-white/60">{t("role")}</span>
          </span>
          <form action={signOutAction} className="ml-auto">
            <button
              type="submit"
              aria-label={tc("signOut")}
              className="flex size-9 items-center justify-center rounded-lg text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            >
              <LogOut aria-hidden="true" className="size-4" />
            </button>
          </form>
        </div>
      </aside>

      <div className="flex min-w-0 flex-col">
        {/* Mobile brand bar + nav */}
        <div className="admin-sidebar flex flex-col gap-3 p-4 text-white md:hidden">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span
                aria-hidden="true"
                className="flex size-9 items-center justify-center rounded-xl bg-lime-500 text-ink"
              >
                <ShieldCheck className="size-5" />
              </span>
              <span className="font-heading text-base font-bold">{t("brand")}</span>
            </div>
            <form action={signOutAction}>
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold"
              >
                <LogOut aria-hidden="true" className="size-4" />
                {tc("signOut")}
              </button>
            </form>
          </div>
          <nav aria-label={t("menu")} className="flex gap-1.5 overflow-x-auto">
            {nav}
          </nav>
        </div>

        {/* Header band */}
        <header className="border-b border-border bg-surface px-4 py-6 md:px-8 md:py-8">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-col gap-1.5">
              <h1 className="font-heading text-2xl font-bold tracking-tight md:text-3xl">
                {title}
              </h1>
              {intro ? <p className="max-w-2xl text-muted">{intro}</p> : null}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {actions}
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
          </div>
        </header>

        <main id="admin-main" className="flex-1 px-4 py-6 md:px-8 md:py-8">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
