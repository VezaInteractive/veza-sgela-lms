import { getTranslations } from "next-intl/server";
import { LanguageSwitcher } from "./language-switcher";
import { ThemeToggle } from "./theme-toggle";

/** Minimal chrome for public and onboarding pages: brand, language, theme. Mobile-first. */
export async function SimpleShell({
  children,
  wide = false,
}: {
  children: React.ReactNode;
  wide?: boolean;
}) {
  const t = await getTranslations();
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        {t("common.skipToContent")}
      </a>
      <header className="flex h-16 items-center justify-between gap-3 border-b border-border px-4 md:px-8">
        <span className="font-heading text-lg font-bold">{t("app.name")}</span>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </header>
      <main
        id="main"
        className={
          "mx-auto flex w-full flex-1 flex-col gap-6 px-4 py-8 " + (wide ? "max-w-6xl" : "max-w-md")
        }
      >
        {children}
      </main>
    </div>
  );
}

/** Wider variant for admin pages. */
export function SimpleShellWide({ children }: { children: React.ReactNode }) {
  return <SimpleShell wide>{children}</SimpleShell>;
}
