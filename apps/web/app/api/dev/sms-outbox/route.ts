import { NextResponse } from "next/server";
import { devOutbox, isConsoleMessaging } from "@sgela/messaging";
import { devPagesEnabled } from "@/lib/dev-pages";

/**
 * GET /api/dev/sms-outbox?to=+27...: messages sent by the console SMS/WhatsApp providers.
 * Lets developers and e2e tests read OTPs and consent links. Never available with a real vendor.
 */
export async function GET(request: Request) {
  const enabled =
    isConsoleMessaging() && (devPagesEnabled() || process.env.ENABLE_SMS_OUTBOX === "1");
  if (!enabled) return new NextResponse(null, { status: 404 });
  const to = new URL(request.url).searchParams.get("to");
  const messages = devOutbox().filter((m) => !to || m.to === to);
  return NextResponse.json({ messages });
}
