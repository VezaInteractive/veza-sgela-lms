"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { setLocale } from "@/i18n/actions";
import { LOCALES } from "@/i18n/config";
import { track } from "@/lib/analytics/client";

export function LanguageSwitcher() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="sr-only">{t("settings.language")}</span>
      <select
        data-testid="language-switcher"
        value={locale}
        disabled={pending}
        onChange={(e) => {
          const next = e.target.value;
          startTransition(async () => {
            await setLocale(next);
            track("language_changed", { from: locale, to: next });
            router.refresh();
          });
        }}
        className="h-10 rounded-md border border-border bg-surface px-2 text-foreground"
      >
        {LOCALES.map((l) => (
          <option key={l} value={l}>
            {t("languages." + l)}
          </option>
        ))}
      </select>
    </label>
  );
}
