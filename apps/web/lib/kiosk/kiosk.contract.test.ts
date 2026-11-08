/**
 * Contract tests: every example in docs/kiosk-api.md is sent through the real route handlers
 * against Postgres (PRD 19.1, M1-5).
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { POST as createSession } from "@/app/api/v1/kiosk/sessions/route";
import { POST as heartbeat } from "@/app/api/v1/kiosk/heartbeat/route";
import { db } from "@/test/factories";
import { createKioskDevice } from "./service";

const doc = readFileSync(path.resolve(__dirname, "../../../../docs/kiosk-api.md"), "utf8");

function example<T = Record<string, unknown>>(name: string): T {
  const re = new RegExp("<!-- contract:" + name + " -->\\s*```json\\s*([\\s\\S]*?)```");
  const m = doc.match(re);
  if (!m) throw new Error("example " + name + " missing from docs/kiosk-api.md");
  return JSON.parse(m[1]!) as T;
}

let deviceId: string;
let key: string;

beforeAll(async () => {
  const created = await createKioskDevice({
    label: "contract test",
    headsetModel: "QUEST_3",
    env: "test",
  });
  deviceId = created.device.id;
  key = created.key;
});

/** The doc example with this device and times shifted to "now", keeping the session length. */
function sessionBody(
  overrides: Record<string, unknown> = {},
): Record<string, unknown> & { results: object[] } {
  const ex = example<{ startedAt: string; endedAt: string; results: object[] }>(
    "create-session-request",
  );
  const length = new Date(ex.endedAt).getTime() - new Date(ex.startedAt).getTime();
  const end = new Date(Date.now() - 60_000);
  return {
    ...ex,
    deviceId,
    startedAt: new Date(end.getTime() - length).toISOString(),
    endedAt: end.toISOString(),
    ...overrides,
  };
}

function post(
  handler: (r: Request) => Promise<Response>,
  url: string,
  body: unknown,
  headers: Record<string, string> = {},
) {
  return handler(
    new Request("http://localhost" + url, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: "Bearer " + key, ...headers },
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
  );
}

describe("POST /api/v1/kiosk/sessions", () => {
  it("accepts the documented request and answers with the documented response shape", async () => {
    const res = await post(createSession, "/api/v1/kiosk/sessions", sessionBody(), {
      "idempotency-key": crypto.randomUUID(),
    });
    expect(res.status).toBe(201);
    const body = (await res.json()) as Record<string, string>;
    const documented = example("create-session-response");
    expect(Object.keys(body).sort()).toEqual(Object.keys(documented).sort());
    expect(body.claimCode).toMatch(/^[0-9A-HJKMNP-TV-Z]{6}$/);
    expect(body.claimUrl).toMatch(new RegExp("/claim/" + body.claimCode + "$"));
    expect(body.qrPngUrl).toMatch(new RegExp("/api/v1/qr/" + body.claimCode + "$"));
    const days = (new Date(body.expiresAt!).getTime() - Date.now()) / 86_400_000;
    expect(days).toBeGreaterThan(29);
    expect(days).toBeLessThan(32);

    const stored = await db.expoSession.findUniqueOrThrow({
      where: { id: body.sessionId },
      include: { results: true },
    });
    expect(stored.results.map((r) => [r.worldCode, r.score, r.simulated]).sort()).toEqual([
      ["AVI", 78, false],
      ["MED", 66, false],
    ]);
  });

  it("replays the same response for a retried Idempotency-Key and never duplicates", async () => {
    const key1 = crypto.randomUUID();
    const body = sessionBody();
    const before = await db.expoSession.count({ where: { deviceId } });
    const first = await post(createSession, "/api/v1/kiosk/sessions", body, {
      "idempotency-key": key1,
    });
    const second = await post(createSession, "/api/v1/kiosk/sessions", body, {
      "idempotency-key": key1,
    });
    expect(first.status).toBe(201);
    expect(second.status).toBe(201);
    expect(second.headers.get("idempotent-replayed")).toBe("true");
    expect(await second.json()).toEqual(await first.json());
    expect(await db.expoSession.count({ where: { deviceId } })).toBe(before + 1);

    const changed = await post(
      createSession,
      "/api/v1/kiosk/sessions",
      sessionBody({ clarityPre: 5 }),
      {
        "idempotency-key": key1,
      },
    );
    expect(changed.status).toBe(422);
    expect(((await changed.json()) as { error: { code: string } }).error.code).toBe(
      "IDEMPOTENCY_KEY_REUSED",
    );
  });

  it("handles concurrent retries with one key as a single session", async () => {
    const k = crypto.randomUUID();
    const body = sessionBody();
    const before = await db.expoSession.count({ where: { deviceId } });
    const results = await Promise.all(
      [1, 2, 3].map(() =>
        post(createSession, "/api/v1/kiosk/sessions", body, { "idempotency-key": k }),
      ),
    );
    // Losers either see 409 IDEMPOTENCY_IN_PROGRESS or a replay of the winner.
    expect(results.every((r) => r.status === 201 || r.status === 409)).toBe(true);
    const ok = results.filter((r) => r.status === 201);
    const codes = await Promise.all(
      ok.map(async (r) => ((await r.json()) as { claimCode: string }).claimCode),
    );
    expect(new Set(codes).size).toBe(1);
    expect(await db.expoSession.count({ where: { deviceId } })).toBe(before + 1);
    const retry = await post(createSession, "/api/v1/kiosk/sessions", body, {
      "idempotency-key": k,
    });
    expect(((await retry.json()) as { claimCode: string }).claimCode).toBe(codes[0]);
  });

  it("uses the documented error envelope", async () => {
    const shape = example<{ error: Record<string, unknown> }>("error-envelope");
    const res = await post(createSession, "/api/v1/kiosk/sessions", sessionBody(), {
      authorization: "Bearer nope",
    });
    expect(res.status).toBe(401);
    const body = (await res.json()) as { error: Record<string, unknown> };
    expect(Object.keys(body)).toEqual(Object.keys(shape));
    expect(body.error).toMatchObject({ code: shape.error.code });
  });

  it.each([
    ["wrong device", () => sessionBody({ deviceId: "kd_someone_else" }), 403, "DEVICE_MISMATCH"],
    [
      "too old",
      () => sessionBody({ startedAt: new Date(Date.now() - 15 * 86_400_000).toISOString() }),
      422,
      "SESSION_TOO_OLD",
    ],
    [
      "future",
      () => sessionBody({ endedAt: new Date(Date.now() + 3_600_000).toISOString() }),
      422,
      "INVALID_TIMES",
    ],
    ["unknown event", () => sessionBody({ expoEventId: "ev_missing" }), 422, "UNKNOWN_EXPO_EVENT"],
    [
      "bad score",
      () => sessionBody({ results: [{ ...sessionBody().results[0], score: 140 }] }),
      400,
      "INVALID_SESSION",
    ],
    ["not json", () => "{oops", 400, "INVALID_JSON"],
  ])("rejects %s", async (_name, make, status, code) => {
    const res = await post(createSession, "/api/v1/kiosk/sessions", make());
    expect(res.status).toBe(status);
    expect(((await res.json()) as { error: { code: string } }).error.code).toBe(code);
  });

  it("accepts sessions synced up to 14 days late", async () => {
    const start = new Date(Date.now() - 13 * 86_400_000);
    const res = await post(
      createSession,
      "/api/v1/kiosk/sessions",
      sessionBody({
        startedAt: start.toISOString(),
        endedAt: new Date(start.getTime() + 900_000).toISOString(),
      }),
    );
    expect(res.status).toBe(201);
  });

  it("rejects revoked devices", async () => {
    const revoked = await createKioskDevice({ label: "revoked", env: "test" });
    await db.kioskDevice.update({ where: { id: revoked.device.id }, data: { active: false } });
    const res = await createSession(
      new Request("http://localhost/api/v1/kiosk/sessions", {
        method: "POST",
        headers: { authorization: "Bearer " + revoked.key },
        body: JSON.stringify(sessionBody({ deviceId: revoked.device.id })),
      }),
    );
    expect(res.status).toBe(401);
  });
});

describe("POST /api/v1/kiosk/heartbeat", () => {
  it("accepts the documented heartbeat and records headset model", async () => {
    const req = { ...example<Record<string, unknown>>("heartbeat-request"), deviceId };
    const res = await post(heartbeat, "/api/v1/kiosk/heartbeat", req);
    expect(res.status).toBe(200);
    const body = (await res.json()) as Record<string, string>;
    expect(Object.keys(body).sort()).toEqual(Object.keys(example("heartbeat-response")).sort());
    const device = await db.kioskDevice.findUniqueOrThrow({ where: { id: deviceId } });
    expect(device).toMatchObject({
      headsetModel: "QUEST_2",
      battery: 76,
      queueDepth: 0,
      appVersion: "1.4.0",
    });
    expect(device.lastSeenAt).not.toBeNull();
  });

  it("rejects unknown headset models", async () => {
    const res = await post(heartbeat, "/api/v1/kiosk/heartbeat", {
      ...example<Record<string, unknown>>("heartbeat-request"),
      deviceId,
      headsetModel: "VIVE",
    });
    expect(res.status).toBe(400);
  });
});
