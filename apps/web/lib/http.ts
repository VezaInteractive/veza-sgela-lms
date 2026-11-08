import { NextResponse } from "next/server";

/** PRD 12.1 error envelope. */
export function apiError(status: number, code: string, message: string, details?: unknown) {
  return NextResponse.json(
    { error: { code, message, ...(details === undefined ? {} : { details }) } },
    { status },
  );
}

/** First hop of x-forwarded-for (set by the hosting proxy), else x-real-ip. */
export function clientIpFrom(h: Headers): string | null {
  const fwd = h.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]?.trim() || null;
  return h.get("x-real-ip");
}

export async function readJson(
  request: Request,
): Promise<{ ok: true; body: unknown } | { ok: false }> {
  try {
    return { ok: true, body: await request.json() };
  } catch {
    return { ok: false };
  }
}

/** Absolute base URL for links in SMS, QR codes and kiosk responses. */
export function appUrl(): string {
  return (process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
}
