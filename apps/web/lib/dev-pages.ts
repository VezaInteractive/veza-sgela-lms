import { notFound } from "next/navigation";

/** Internal dev pages (/dev/*, /api/dev/*) are hidden in production unless explicitly enabled. */
export function devPagesEnabled() {
  return process.env.NODE_ENV !== "production" || process.env.ENABLE_DEV_PAGES === "1";
}

export function assertDevPages() {
  if (!devPagesEnabled()) notFound();
}
