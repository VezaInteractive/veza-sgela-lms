"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  ChevronUp,
  CircleHelp,
  Headset,
  MessageCircleQuestion,
  ShieldCheck,
  Ticket,
  X,
} from "lucide-react";
import { cn } from "@sgela/ui";
import { track } from "@/lib/analytics/client";

/**
 * Bottom-right support dock (D-027, reference "Support ^" pill + chat button): a Support pill
 * that opens a small menu (help, privacy, add expo results, coach) and the round coach button.
 * Only one panel is open at a time; Escape or a click outside closes it.
 */
export function SupportDock() {
  const t = useTranslations("nav");
  const tc = useTranslations("coach");
  const [open, setOpen] = useState<"menu" | "coach" | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(null);
    }
    function onClick(e: MouseEvent) {
      if (root.current && !root.current.contains(e.target as Node)) setOpen(null);
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  function toggle(which: "menu" | "coach") {
    const next = open === which ? null : which;
    if (next === "menu") track("support_opened", {});
    if (next === "coach") track("coach_opened", { source: "fab" });
    setOpen(next);
  }

  const items = [
    { href: "/help", label: t("help"), icon: CircleHelp },
    { href: "/me/privacy", label: t("privacy"), icon: ShieldCheck },
    { href: "/me#add-results", label: t("addResults"), icon: Ticket },
  ];

  return (
    <div
      ref={root}
      className="fixed right-4 bottom-20 z-50 flex flex-col items-end gap-2 md:bottom-6"
    >
      {open === "menu" ? (
        <div
          id={menuId}
          className="glass w-64 rounded-2xl p-2 shadow-xl"
          aria-label={t("supportMenu")}
          role="region"
        >
          <ul className="flex flex-col">
            {items.map(({ href, label, icon: Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  onClick={() => setOpen(null)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold hover:bg-surface-raised"
                >
                  <Icon aria-hidden="true" className="size-4 shrink-0 text-muted" />
                  {label}
                </Link>
              </li>
            ))}
            <li>
              <button
                type="button"
                onClick={() => toggle("coach")}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold hover:bg-surface-raised"
              >
                <MessageCircleQuestion aria-hidden="true" className="size-4 shrink-0 text-muted" />
                {t("askCoach")}
              </button>
            </li>
          </ul>
        </div>
      ) : null}
      {open === "coach" ? (
        <div role="status" className="glass max-w-64 rounded-2xl p-4 text-sm shadow-xl">
          {tc("comingSoon")}
        </div>
      ) : null}

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => toggle("menu")}
          aria-expanded={open === "menu"}
          aria-controls={open === "menu" ? menuId : undefined}
          data-testid="support-pill"
          className="flex h-14 items-center gap-2 rounded-full bg-primary px-5 font-semibold text-primary-foreground shadow-lg transition-transform hover:scale-105"
        >
          <Headset aria-hidden="true" className="size-5" />
          <span className="hidden sm:inline">{t("support")}</span>
          <span className="sr-only sm:hidden">{t("support")}</span>
          <ChevronUp
            aria-hidden="true"
            className={cn("size-4 transition-transform", open === "menu" && "rotate-180")}
          />
        </button>
        <button
          type="button"
          onClick={() => toggle("coach")}
          aria-expanded={open === "coach"}
          aria-label={tc("open")}
          data-testid="coach-fab"
          className="flex size-14 items-center justify-center rounded-full bg-ink text-lime-500 shadow-lg ring-2 ring-primary transition-transform hover:scale-105 dark:bg-primary dark:text-primary-foreground dark:ring-0"
        >
          {open === "coach" ? (
            <X aria-hidden className="size-6" />
          ) : (
            <MessageCircleQuestion aria-hidden className="size-6" />
          )}
        </button>
      </div>
    </div>
  );
}
