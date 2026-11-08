"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { Moon, Sun } from "lucide-react";
import { track } from "@/lib/analytics/client";

const noopSubscribe = () => () => {};

export function ThemeToggle() {
  const t = useTranslations("settings");
  const { resolvedTheme, setTheme } = useTheme();
  // false during SSR, true after hydration; avoids a theme-icon mismatch.
  const mounted = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );

  const isDark = !mounted || resolvedTheme !== "light";
  const next = isDark ? "light" : "dark";
  const Icon = isDark ? Sun : Moon;

  return (
    <button
      type="button"
      data-testid="theme-toggle"
      onClick={() => {
        setTheme(next);
        track("theme_changed", { to: next });
      }}
      aria-label={t("theme") + ": " + (isDark ? t("themeLight") : t("themeDark"))}
      className="flex size-10 items-center justify-center rounded-md border border-border bg-surface text-foreground hover:border-primary"
    >
      <Icon aria-hidden className="size-5" />
    </button>
  );
}
