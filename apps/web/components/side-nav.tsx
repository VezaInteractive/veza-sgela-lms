"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useSyncExternalStore } from "react";
import { PanelLeftClose, PanelLeftOpen, Compass } from "lucide-react";
import { cn } from "@sgela/ui";
import { NAV_ITEMS, isActive } from "./nav-items";

const STORAGE_KEY = "sgela.sidenav.collapsed";

function readCollapsed() {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

const listeners = new Set<() => void>();

function writeCollapsed(value: boolean) {
  try {
    localStorage.setItem(STORAGE_KEY, value ? "1" : "0");
  } catch {
    // storage unavailable: preference simply not remembered
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]!.toUpperCase())
      .join("") || "?"
  );
}

export function SideNav({ userName }: { userName: string }) {
  const pathname = usePathname();
  const t = useTranslations("nav");
  const tApp = useTranslations("app");
  const collapsed = useSyncExternalStore(subscribe, readCollapsed, () => false);

  function toggle() {
    writeCollapsed(!collapsed);
  }

  const ToggleIcon = collapsed ? PanelLeftOpen : PanelLeftClose;

  return (
    <aside
      data-testid="side-nav"
      className={cn(
        "brand-pattern sticky top-0 hidden h-dvh shrink-0 flex-col text-ink md:flex",
        collapsed ? "w-20" : "w-64",
      )}
    >
      <div className={cn("flex h-20 items-center gap-2.5", collapsed ? "justify-center" : "px-6")}>
        <span
          aria-hidden
          className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-ink text-lime-500"
        >
          <Compass className="size-6" />
        </span>
        {collapsed ? null : (
          <span className="font-heading text-2xl font-extrabold tracking-tight">
            {tApp("name")}
          </span>
        )}
      </div>
      <nav aria-label={t("primary")} className="flex-1 px-3 py-4">
        <ul className="flex flex-col gap-1">
          {NAV_ITEMS.map(({ key, href, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <li key={key}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  title={collapsed ? t(key) : undefined}
                  className={cn(
                    "flex h-11 items-center gap-3 rounded-xl px-3 font-semibold transition-colors",
                    collapsed && "justify-center",
                    active
                      ? "bg-white text-ink shadow-sm"
                      : "text-ink/85 hover:bg-ink/10 hover:text-ink",
                  )}
                >
                  <Icon aria-hidden className="size-5 shrink-0" />
                  <span className={collapsed ? "sr-only" : undefined}>{t(key)}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <button
        type="button"
        onClick={toggle}
        aria-expanded={!collapsed}
        className={cn(
          "mx-3 flex h-11 items-center gap-3 rounded-xl px-3 font-medium text-ink/85 hover:bg-ink/10 hover:text-ink",
          collapsed && "justify-center",
        )}
      >
        <ToggleIcon aria-hidden className="size-5" />
        <span className={collapsed ? "sr-only" : undefined}>
          {collapsed ? t("expand") : t("collapse")}
        </span>
      </button>
      <div
        className={cn(
          "m-3 flex items-center gap-3 rounded-xl bg-ink/10 p-2.5",
          collapsed && "justify-center",
        )}
      >
        <span
          aria-hidden
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-ink font-heading text-sm font-bold text-lime-500"
        >
          {initials(userName)}
        </span>
        <span className={cn("truncate text-sm font-semibold", collapsed && "sr-only")}>
          {userName}
        </span>
      </div>
    </aside>
  );
}
