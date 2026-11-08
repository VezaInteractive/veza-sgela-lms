import { NextResponse } from "next/server";
import { eventBatchSchema } from "@/lib/analytics/schema";
import { trackEvents } from "@/lib/analytics/server";
import { REQUEST_ID_HEADER } from "@/lib/request-id";

/** POST /api/v1/events — batched product analytics (PRD 12.2). Rate limits added in M1. */
export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json(
      { error: { code: "INVALID_JSON", message: "Body must be JSON" } },
      { status: 400 },
    );
  }
  const parsed = eventBatchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: "INVALID_EVENTS",
          message: "Invalid event batch",
          details: parsed.error.issues,
        },
      },
      { status: 400 },
    );
  }
  const requestId = request.headers.get(REQUEST_ID_HEADER) ?? undefined;
  await trackEvents(
    parsed.data.events.map((e) => ({
      name: e.name,
      props: e.props,
      anonId: e.anonId,
      requestId,
      occurredAt: new Date(e.occurredAt),
    })),
  );
  return new NextResponse(null, { status: 202 });
}
