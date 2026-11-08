import { getDb, Prisma, type KioskDevice, type PrismaClient } from "@sgela/db";
import {
  generateClaimCode,
  type CreateKioskSession,
  type CreateKioskSessionResponse,
  type KioskHeartbeat,
} from "@sgela/contracts";
import { randomToken, sha256 } from "@/lib/crypto";
import { appUrl } from "@/lib/http";

export const MAX_BACKDATE_MS = 14 * 24 * 60 * 60_000;
export const CLOCK_SKEW_MS = 5 * 60_000;
const SAST_OFFSET_MS = 2 * 60 * 60_000;
const KEY_PATTERN = /^vk_(live|test)_[A-Za-z0-9_-]{24,}$/;

export class KioskError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}

/** New device key: shown once, stored as sha256 only (PRD 12.3). */
export function newDeviceKey(env: "live" | "test" = "live"): { key: string; hash: string } {
  const key = "vk_" + env + "_" + randomToken(24);
  return { key, hash: sha256(key) };
}

export async function createKioskDevice(
  input: {
    id?: string;
    label: string;
    headsetModel?: string;
    unitCode?: string;
    env?: "live" | "test";
  },
  db: PrismaClient = getDb(),
) {
  const { key, hash } = newDeviceKey(input.env);
  const device = await db.kioskDevice.create({
    data: {
      ...(input.id ? { id: input.id } : {}),
      label: input.label,
      headsetModel: input.headsetModel ?? null,
      unitCode: input.unitCode ?? null,
      apiKeyHash: hash,
    },
  });
  return { device, key };
}

/** Resolve the device from the Authorization bearer key (vk_live_... or vk_test_...). */
export async function authenticateDevice(
  authorization: string | null,
  db: PrismaClient = getDb(),
): Promise<KioskDevice> {
  const key = authorization?.match(/^Bearer\s+(\S+)$/i)?.[1];
  if (!key || !KEY_PATTERN.test(key)) {
    throw new KioskError(401, "UNAUTHENTICATED", "Missing or malformed device key");
  }
  const device = await db.kioskDevice.findUnique({ where: { apiKeyHash: sha256(key) } });
  if (!device || !device.active) {
    throw new KioskError(401, "UNAUTHENTICATED", "Unknown or revoked device key");
  }
  return device;
}

export function assertDeviceMatches(device: KioskDevice, deviceId: string) {
  if (device.id !== deviceId) {
    throw new KioskError(403, "DEVICE_MISMATCH", "deviceId does not match the API key");
  }
}

/** End of the day (23:59:59 SAST) a number of days after a moment, as in PRD 12.3. */
export function claimExpiry(from: Date, days: number): Date {
  const local = new Date(from.getTime() + SAST_OFFSET_MS + days * 24 * 60 * 60_000);
  local.setUTCHours(23, 59, 59, 0);
  return new Date(local.getTime() - SAST_OFFSET_MS);
}

async function claimExpiryDays(db: PrismaClient): Promise<number> {
  const row = await db.setting.findUnique({ where: { key: "claim.expiryDays" } });
  const n = Number(row?.value);
  return Number.isInteger(n) && n > 0 ? n : 30;
}

export function sessionResponse(s: {
  id: string;
  claimCode: string;
  claimExpiresAt: Date;
}): CreateKioskSessionResponse {
  const base = appUrl();
  return {
    sessionId: s.id,
    claimCode: s.claimCode,
    claimUrl: base + "/claim/" + s.claimCode,
    qrPngUrl: base + "/api/v1/qr/" + s.claimCode,
    expiresAt: s.claimExpiresAt.toISOString(),
  };
}

/** Create an expo session + results and a unique claim code. Shared by the API and the simulator. */
export async function createExpoSession(
  deviceId: string,
  payload: CreateKioskSession,
  opts: { simulated?: boolean; now?: Date; db?: PrismaClient } = {},
): Promise<CreateKioskSessionResponse> {
  const db = opts.db ?? getDb();
  const now = opts.now ?? new Date();
  const startedAt = new Date(payload.startedAt);
  const endedAt = new Date(payload.endedAt);
  if (endedAt < startedAt) {
    throw new KioskError(422, "INVALID_TIMES", "endedAt is before startedAt");
  }
  if (endedAt.getTime() > now.getTime() + CLOCK_SKEW_MS) {
    throw new KioskError(422, "INVALID_TIMES", "Session times are in the future");
  }
  if (startedAt.getTime() < now.getTime() - MAX_BACKDATE_MS) {
    throw new KioskError(422, "SESSION_TOO_OLD", "startedAt is more than 14 days in the past");
  }
  if (payload.expoEventId) {
    const event = await db.expoEvent.findUnique({
      where: { id: payload.expoEventId },
      select: { id: true },
    });
    if (!event) throw new KioskError(422, "UNKNOWN_EXPO_EVENT", "expoEventId does not exist");
  }
  const claimExpiresAt = claimExpiry(now, await claimExpiryDays(db));

  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const session = await db.expoSession.create({
        data: {
          deviceId,
          expoEventId: payload.expoEventId ?? null,
          claimCode: generateClaimCode(),
          claimExpiresAt,
          startedAt,
          endedAt,
          ageBand: payload.ageBand ?? null,
          gradeBand: payload.gradeBand ?? null,
          clarityPre: payload.clarityPre ?? null,
          results: {
            create: payload.results.map((r) => ({
              worldCode: r.worldCode,
              scenarioId: r.scenarioId,
              appVersion: r.appVersion,
              score: r.score,
              durationSec: r.durationSec,
              accuracy: r.accuracy ?? null,
              safetyErrors: r.safetyErrors ?? null,
              decisionScore: r.decisionScore ?? null,
              completed: r.completed,
              rubric: r.rubric as Prisma.InputJsonValue,
              events: (r.events ?? undefined) as Prisma.InputJsonValue | undefined,
              simulated: opts.simulated ?? false,
              recordedAt: endedAt,
            })),
          },
        },
      });
      return sessionResponse(session);
    } catch (err) {
      const collision =
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2002" &&
        JSON.stringify(err.meta ?? {}).includes("claimCode");
      if (!collision) throw err;
    }
  }
  throw new KioskError(503, "CLAIM_CODE_EXHAUSTED", "Could not allocate a unique claim code");
}

export async function recordHeartbeat(
  device: KioskDevice,
  hb: KioskHeartbeat,
  db: PrismaClient = getDb(),
  now = new Date(),
) {
  const updated = await db.kioskDevice.update({
    where: { id: device.id },
    data: {
      lastSeenAt: now,
      appVersion: hb.appVersion,
      headsetModel: hb.headsetModel ?? device.headsetModel,
      battery: hb.battery ?? null,
      queueDepth: hb.queueDepth ?? null,
    },
  });
  return { deviceId: updated.id, serverTime: now.toISOString() };
}

export type Replay = { status: number; body: unknown; replayed: boolean };

/**
 * Idempotency-Key handling (PRD 12.1/12.3). Same key + same body replays the stored response;
 * same key + different body is a 422. Keys are scoped per device.
 */
export async function withIdempotency(
  input: {
    deviceId: string;
    key: string | null;
    route: string;
    rawBody: string;
    db?: PrismaClient;
  },
  handler: () => Promise<{ status: number; body: unknown }>,
): Promise<Replay> {
  const db = input.db ?? getDb();
  if (!input.key) return { ...(await handler()), replayed: false };
  if (!/^[A-Za-z0-9._:-]{8,128}$/.test(input.key)) {
    throw new KioskError(
      400,
      "INVALID_IDEMPOTENCY_KEY",
      "Idempotency-Key must be 8-128 safe characters",
    );
  }
  const requestHash = sha256(input.route + "\n" + input.rawBody);
  const where = { deviceId_key: { deviceId: input.deviceId, key: input.key } };

  // Reserve the key first (statusCode 0 = in progress) so concurrent retries never both run.
  try {
    await db.idempotencyRecord.create({
      data: {
        deviceId: input.deviceId,
        key: input.key,
        route: input.route,
        requestHash,
        statusCode: PENDING,
        responseBody: {},
      },
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      const existing = await db.idempotencyRecord.findUnique({ where });
      if (existing) return replay(existing, requestHash);
    }
    throw err;
  }

  let result: { status: number; body: unknown };
  try {
    result = await handler();
  } catch (err) {
    await db.idempotencyRecord.delete({ where });
    throw err;
  }
  if (result.status >= 500) {
    // Not stored: a retry should run again.
    await db.idempotencyRecord.delete({ where });
    return { ...result, replayed: false };
  }
  await db.idempotencyRecord.update({
    where,
    data: { statusCode: result.status, responseBody: result.body as Prisma.InputJsonValue },
  });
  return { ...result, replayed: false };
}

const PENDING = 0;

function replay(
  rec: { requestHash: string; statusCode: number; responseBody: unknown },
  requestHash: string,
): Replay {
  if (rec.statusCode === PENDING) {
    throw new KioskError(
      409,
      "IDEMPOTENCY_IN_PROGRESS",
      "A request with this Idempotency-Key is still being processed; retry shortly",
    );
  }
  if (rec.requestHash !== requestHash) {
    throw new KioskError(
      422,
      "IDEMPOTENCY_KEY_REUSED",
      "Idempotency-Key was already used with a different request",
    );
  }
  return { status: rec.statusCode, body: rec.responseBody, replayed: true };
}
