"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Bell, CheckCheck } from "lucide-react";
import { cn } from "@sgela/ui";
import { track } from "@/lib/analytics/client";

export interface Notice {
  id: string;
  title: string;
  body: string;
}

const SEEN_KEY = "sgela.notices.seen";
const listeners = new Set<() => void>();

function readSeen(): string {
  try {
    return localStorage.getItem(SEEN_KEY) ?? "";
  } catch {
    return "";
  }
}

function writeSeen(ids: string[]) {
  try {
    localStorage.setItem(SEEN_KEY, ids.join(","));
  } catch {
    // storage unavailable: unread state simply resets next visit
  }
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  window.addEventListener("storage", l);
  return () => {
    listeners.delete(l);
    window.removeEventListener("storage", l);
  };
}

/**
 * Top-bar notifications bell (D-027): unread count badge and a dropdown of notices with
 * "Mark all as read". Read state is a per-device convenience in localStorage; the server-side
 * notification inbox arrives with messaging (M5/M6).
 */
export function NotificationBell({ notices }: { notices: Notice[] }) {
  const t = useTranslations("nav");
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const panelId = useId();
  // Server render and first paint assume everything is read, so the badge never flashes wrong.
  const seenRaw = useSyncExternalStore(subscribe, readSeen, () => null);
  const seen = new Set(seenRaw === null ? notices.map((n) => n.id) : seenRaw.split(","));
  const unread = notices.filter((n) => !seen.has(n.id)).length;

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    function onClick(e: MouseEvent) {
      if (root.current && !root.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        data-testid="notification-bell"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        aria-label={t("notifications") + ", " + t("unread", { n: unread })}
        onClick={() => {
          if (!open) track("notifications_opened", { unread });
          setOpen(!open);
        }}
        className="relative flex size-10 items-center justify-center rounded-md border border-border bg-surface text-foreground hover:border-primary"
      >
        <Bell aria-hidden="true" className="size-5" />
        {unread > 0 ? (
          <span
            aria-hidden="true"
            className="absolute -top-1.5 -right-1.5 flex min-w-5 items-center justify-center rounded-full bg-ink px-1 text-[11px] font-bold text-lime-500 ring-2 ring-(--surface) dark:bg-primary dark:text-primary-foreground"
          >
            {unread}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          id={panelId}
          role="region"
          aria-label={t("notifications")}
          className="glass absolute top-12 right-0 z-50 flex w-[min(22rem,calc(100vw-2rem))] flex-col rounded-2xl shadow-xl"
        >
          <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
            <h2 className="font-heading text-base font-semibold">{t("notifications")}</h2>
            <button
              type="button"
              onClick={() => writeSeen(notices.map((n) => n.id))}
              disabled={unread === 0}
              className="flex items-center gap-1 text-xs font-semibold text-link hover:underline disabled:text-muted disabled:no-underline"
            >
              <CheckCheck aria-hidden="true" className="size-4" />
              {t("markAllRead")}
            </button>
          </div>
          {notices.length === 0 ? (
            <p className="px-4 py-6 text-sm text-muted">{t("noNotifications")}</p>
          ) : (
            <ul className="flex max-h-80 flex-col overflow-y-auto p-2">
              {notices.map((n) => {
                const isUnread = !seen.has(n.id);
                return (
                  <li key={n.id} className="flex gap-3 rounded-xl p-3 hover:bg-surface-raised">
                    <span
                      aria-hidden="true"
                      className={cn(
                        "mt-1.5 size-2 shrink-0 rounded-full",
                        isUnread ? "bg-primary" : "bg-transparent",
                      )}
                    />
                    <span className="flex flex-col gap-0.5">
                      <span className={cn("text-sm", isUnread ? "font-bold" : "font-semibold")}>
                        {n.title}
                      </span>
                      <span className="text-sm text-muted">{n.body}</span>
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
          <Link
            href="/home#notices"
            onClick={() => setOpen(false)}
            className="border-t border-border px-4 py-3 text-center text-sm font-semibold text-link hover:underline"
          >
            {t("seeAll")}
          </Link>
        </div>
      ) : null}
    </div>
  );
}
