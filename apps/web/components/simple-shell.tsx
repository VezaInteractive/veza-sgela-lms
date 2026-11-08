import { Compass } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { WorldIcon } from "./demo/world-visuals";
import { LanguageSwitcher } from "./language-switcher";
import { ThemeToggle } from "./theme-toggle";

const WORLD_CODES = ["AVI", "ENG", "CUL", "MED", "AGR"] as const;

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
      <header className="flex h-16 items-center justify-between gap-3 px-4 md:px-8">
        <span className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-[0_0_24px_-4px_var(--primary)]"
          >
            <Compass className="size-5" />
          </span>
          <span className="font-heading text-xl font-bold">{t("app.name")}</span>
        </span>
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
        {wide ? (
          children
        ) : (
          <>
            <div aria-hidden="true" className="fade-up flex justify-center gap-2 pt-2">
              {WORLD_CODES.map((code) => (
                <WorldIcon key={code} code={code} size="sm" />
              ))}
            </div>
            <div className="glass flex flex-col gap-6 rounded-3xl p-6 shadow-[0_24px_64px_-32px_rgba(0,0,0,0.6)] md:p-8">
              {children}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

/** Wider variant for admin pages. */
export function SimpleShellWide({ children }: { children: React.ReactNode }) {
  return <SimpleShell wide>{children}</SimpleShell>;
}
