import { getTranslations } from "next-intl/server";
import { BrandBanner, BrandPanel } from "./brand/brand-panel";
import { Wordmark } from "./brand/wordmark";
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
  const skip = (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
    >
      {t("common.skipToContent")}
    </a>
  );
  const controls = (
    <div className="flex items-center gap-2">
      <LanguageSwitcher />
      <ThemeToggle />
    </div>
  );

  if (wide) {
    return (
      <div className="flex min-h-dvh flex-col">
        {skip}
        <header className="flex h-16 items-center justify-between gap-3 border-b border-border bg-surface px-4 md:h-20 md:px-8">
          <Wordmark />
          {controls}
        </header>
        <main id="main" className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-8">
          {children}
        </main>
      </div>
    );
  }

  // Sign-up and public pages: form half + animated brand half (D-022, reference screens 1-5).
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-2">
      {skip}
      <div className="flex min-h-dvh flex-col">
        <header className="flex h-16 items-center justify-between gap-3 px-4 md:h-20 md:px-8">
          <Wordmark className="lg:invisible" />
          {controls}
        </header>
        <BrandBanner className="lg:hidden" />
        <main
          id="main"
          className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-8 md:max-w-lg"
        >
          <div className="glass flex flex-col gap-6 rounded-3xl p-6 md:p-8">{children}</div>
        </main>
      </div>
      <BrandPanel className="sticky top-0 hidden h-dvh lg:block" />
    </div>
  );
}

/** Wider variant for admin pages. */
export function SimpleShellWide({ children }: { children: React.ReactNode }) {
  return <SimpleShell wide>{children}</SimpleShell>;
}
