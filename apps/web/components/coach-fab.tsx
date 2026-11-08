"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { MessageCircleQuestion, X } from "lucide-react";
import { track } from "@/lib/analytics/client";

/** Placeholder floating coach entry point (L-HM-8). Real panel lands in M6. */
export function CoachFab() {
  const t = useTranslations("coach");
  const [open, setOpen] = useState(false);

  function toggle() {
    if (!open) track("coach_opened", { source: "fab" });
    setOpen(!open);
  }

  return (
    <div className="fixed right-4 bottom-20 z-50 flex flex-col items-end gap-2 md:bottom-6">
      {open ? (
        <div
          role="status"
          className="max-w-64 rounded-lg border border-border bg-surface-raised p-4 text-sm shadow-lg"
        >
          {t("comingSoon")}
        </div>
      ) : null}
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-label={t("open")}
        data-testid="coach-fab"
        className="flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105"
      >
        {open ? (
          <X aria-hidden className="size-6" />
        ) : (
          <MessageCircleQuestion aria-hidden className="size-6" />
        )}
      </button>
    </div>
  );
}
