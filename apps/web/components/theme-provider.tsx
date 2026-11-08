"use client";

import { ThemeProvider as NextThemes } from "next-themes";

/** Light by default (D-021); dark is one tap away and the choice is persisted. */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemes
      attribute="data-theme"
      defaultTheme="light"
      enableSystem={false}
      themes={["dark", "light"]}
    >
      {children}
    </NextThemes>
  );
}
