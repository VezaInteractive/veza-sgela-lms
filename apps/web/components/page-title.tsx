"use client";

import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { NAV_ITEMS, isActive } from "./nav-items";

/** Section name in the top bar (not a heading: each page keeps its own h1). */
export function PageTitle() {
  const pathname = usePathname();
  const t = useTranslations("nav");
  const item = NAV_ITEMS.find((i) => isActive(pathname, i.href));
  return (
    <span className="truncate font-heading text-xl font-bold md:text-2xl">
      {item ? t(item.key) : null}
    </span>
  );
}
