import { notFound } from "next/navigation";
import { devPagesEnabled } from "@/lib/dev-pages";

/** GET /api/dev/boom throws on purpose to verify Sentry wiring (M0-5). Dev only. */
export function GET() {
  if (!devPagesEnabled()) notFound();
  throw new Error("Sgela Sentry test error (intentional)");
}
