"use client";

import { ThemeProvider as NextThemes } from "next-themes";

/** Dark-first; respects prefers-color-scheme; user choice persisted (PRD 14.1). */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemes
      attribute="data-theme"
      defaultTheme="system"
      enableSystem
      themes={["dark", "light"]}
    >
      {children}
    </NextThemes>
  );
}
