import { NextResponse } from "next/server";
import { heartbeatSchema } from "@sgela/contracts";
import { apiError, readJson } from "@/lib/http";
import {
  KioskError,
  assertDeviceMatches,
  authenticateDevice,
  recordHeartbeat,
} from "@/lib/kiosk/service";
import { logger } from "@/lib/logger";

/** POST /api/v1/kiosk/heartbeat: updates lastSeenAt, app version, headset model, battery, queue. */
export async function POST(request: Request) {
  try {
    const device = await authenticateDevice(request.headers.get("authorization"));
    const json = await readJson(request);
    if (!json.ok) return apiError(400, "INVALID_JSON", "Body must be JSON");
    const parsed = heartbeatSchema.safeParse(json.body);
    if (!parsed.success) {
      return apiError(400, "INVALID_HEARTBEAT", "Invalid heartbeat payload", parsed.error.issues);
    }
    assertDeviceMatches(device, parsed.data.deviceId);
    return NextResponse.json(await recordHeartbeat(device, parsed.data));
  } catch (err) {
    if (err instanceof KioskError) return apiError(err.status, err.code, err.message);
    logger.error({ err }, "kiosk heartbeat failed");
    return apiError(500, "INTERNAL", "Something went wrong");
  }
}
