import { getTranslations } from "next-intl/server";
import { BottomNav } from "./bottom-nav";
import { CoachFab } from "./coach-fab";
import { LanguageSwitcher } from "./language-switcher";
import { SideNav } from "./side-nav";
import { ThemeToggle } from "./theme-toggle";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const t = await getTranslations();
  return (
    <div className="flex min-h-dvh">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        {t("common.skipToContent")}
      </a>
      <SideNav />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-border bg-background/90 px-4 backdrop-blur md:justify-end md:px-8">
          <span className="font-heading text-lg font-bold md:hidden">{t("app.name")}</span>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </header>
        <main id="main" className="flex-1 px-4 pt-6 pb-28 md:px-8 md:pb-10">
          {children}
        </main>
      </div>
      <BottomNav />
      <CoachFab />
    </div>
  );
}
