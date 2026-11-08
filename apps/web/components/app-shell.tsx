import { Compass, LogOut } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { signOutAction } from "@/app/(auth)/start/actions";
import { getCurrentSession } from "@/lib/auth/session";
import { BottomNav } from "./bottom-nav";
import { CoachFab } from "./coach-fab";
import { LanguageSwitcher } from "./language-switcher";
import { PageTitle } from "./page-title";
import { SideNav } from "./side-nav";
import { ThemeToggle } from "./theme-toggle";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const t = await getTranslations();
  const session = await getCurrentSession();
  const learner = session?.user.learner;
  const userName = learner ? [learner.firstName, learner.lastName].filter(Boolean).join(" ") : "";
  return (
    <div className="flex min-h-dvh">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        {t("common.skipToContent")}
      </a>
      <SideNav userName={userName} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-border bg-surface px-4 md:h-20 md:px-8">
          <div className="flex min-w-0 items-center gap-2.5">
            <span
              aria-hidden="true"
              className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-ink md:hidden"
            >
              <Compass className="size-5" />
            </span>
            <PageTitle />
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
            <form action={signOutAction} className="hidden sm:block">
              <button
                type="submit"
                className="flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
              >
                <LogOut aria-hidden="true" className="size-4" />
                {t("common.signOut")}
              </button>
            </form>
          </div>
        </header>
        <main id="main" className="flex-1 px-4 pt-6 pb-28 md:px-8 md:pt-8 md:pb-10">
          {children}
        </main>
      </div>
      <BottomNav />
      <CoachFab />
    </div>
  );
}
