import { NextResponse } from "next/server";
import { createKioskSessionSchema } from "@sgela/contracts";
import { trackEvent } from "@/lib/analytics/server";
import { apiError } from "@/lib/http";
import {
  KioskError,
  assertDeviceMatches,
  authenticateDevice,
  createExpoSession,
  withIdempotency,
} from "@/lib/kiosk/service";
import { logger } from "@/lib/logger";

/** POST /api/v1/kiosk/sessions (PRD 12.3, docs/kiosk-api.md). */
export async function POST(request: Request) {
  try {
    const device = await authenticateDevice(request.headers.get("authorization"));
    const rawBody = await request.text();
    const result = await withIdempotency(
      {
        deviceId: device.id,
        key: request.headers.get("idempotency-key"),
        route: "POST /api/v1/kiosk/sessions",
        rawBody,
      },
      async () => {
        let json: unknown;
        try {
          json = JSON.parse(rawBody);
        } catch {
          return {
            status: 400,
            body: { error: { code: "INVALID_JSON", message: "Body must be JSON" } },
          };
        }
        const parsed = createKioskSessionSchema.safeParse(json);
        if (!parsed.success) {
          return {
            status: 400,
            body: {
              error: {
                code: "INVALID_SESSION",
                message: "Invalid session payload",
                details: parsed.error.issues,
              },
            },
          };
        }
        try {
          assertDeviceMatches(device, parsed.data.deviceId);
          const created = await createExpoSession(device.id, parsed.data);
          await trackEvent({
            name: "expo_session",
            props: { deviceId: device.id, worlds: parsed.data.results.length },
          });
          return { status: 201, body: created };
        } catch (err) {
          if (err instanceof KioskError) {
            return {
              status: err.status,
              body: { error: { code: err.code, message: err.message } },
            };
          }
          throw err;
        }
      },
    );
    return NextResponse.json(result.body, {
      status: result.status,
      headers: result.replayed ? { "Idempotent-Replayed": "true" } : undefined,
    });
  } catch (err) {
    if (err instanceof KioskError) return apiError(err.status, err.code, err.message);
    logger.error({ err }, "kiosk session failed");
    return apiError(500, "INTERNAL", "Something went wrong");
  }
}
