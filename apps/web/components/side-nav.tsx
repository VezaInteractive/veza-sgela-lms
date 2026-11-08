"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useSyncExternalStore } from "react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
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

export function SideNav() {
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
        "sticky top-0 hidden h-dvh shrink-0 flex-col border-r border-border bg-surface md:flex",
        collapsed ? "w-20" : "w-64",
      )}
    >
      <div className="flex h-16 items-center gap-2 px-5">
        <span aria-hidden className="size-8 shrink-0 rounded-md bg-primary" />
        {collapsed ? null : <span className="font-heading text-xl font-bold">{tApp("name")}</span>}
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
                    "flex h-11 items-center gap-3 rounded-md px-3 font-medium transition-colors",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted hover:bg-surface-raised hover:text-foreground",
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
        className="m-3 flex h-11 items-center gap-3 rounded-md px-3 text-muted hover:bg-surface-raised hover:text-foreground"
      >
        <ToggleIcon aria-hidden className="size-5" />
        <span className={collapsed ? "sr-only" : undefined}>
          {collapsed ? t("expand") : t("collapse")}
        </span>
      </button>
    </aside>
  );
}
