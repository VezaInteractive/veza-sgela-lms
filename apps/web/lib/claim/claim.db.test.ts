import { describe, expect, it } from "vitest";
import { createKioskSessionSchema } from "@sgela/contracts";
import { createLearner, db } from "@/test/factories";
import { createExpoSession, newDeviceKey } from "@/lib/kiosk/service";
import { claimSession, linkedResults, previewClaim } from "./service";

async function simulatedSession(now = new Date()) {
  const id = "kd_claimtest";
  await db.kioskDevice.upsert({
    where: { id },
    update: {},
    create: { id, label: "claim test", apiKeyHash: newDeviceKey("test").hash },
  });
  const payload = createKioskSessionSchema.parse({
    deviceId: id,
    startedAt: new Date(now.getTime() - 20 * 60_000).toISOString(),
    endedAt: now.toISOString(),
    results: [
      {
        worldCode: "AVI",
        scenarioId: "avi.preflight.v1",
        appVersion: "sim",
        score: 78,
        durationSec: 410,
        completed: true,
      },
      {
        worldCode: "MED",
        scenarioId: "med.ward.v1",
        appVersion: "sim",
        score: 66,
        durationSec: 500,
        completed: true,
      },
    ],
  });
  return createExpoSession(id, payload, { simulated: true, now });
}

describe("claim flow", () => {
  it("previews without PII, links results and signals, and blocks a second account", async () => {
    const res = await simulatedSession();
    const lower = res.claimCode.slice(0, 3).toLowerCase() + "-" + res.claimCode.slice(3);
    const preview = await previewClaim(lower, null);
    expect(preview).toMatchObject({ ok: true, preview: { code: res.claimCode, claimed: false } });
    if (preview.ok) {
      expect(preview.preview.worlds).toEqual([
        { worldCode: "AVI", score: 78, completed: true },
        { worldCode: "MED", score: 66, completed: true },
      ]);
      expect(Object.keys(preview.preview)).not.toContain("claimedByLearnerId");
    }

    const thandeka = await createLearner({ age: 16 });
    const linked = await claimSession(res.claimCode, thandeka.id);
    expect(linked).toMatchObject({ ok: true, alreadyLinked: false, worlds: ["AVI", "MED"] });
    expect(
      (await linkedResults(thandeka.id)).map((r) => [r.worldCode, r.score, r.simulated]),
    ).toEqual(
      expect.arrayContaining([
        ["AVI", 78, true],
        ["MED", 66, true],
      ]),
    );
    const signals = await db.interestSignal.findMany({
      where: { source: "expo_simulated", districtCode: "DC34" },
      orderBy: { id: "desc" },
      take: 2,
    });
    expect(signals.map((s) => s.industryCode).sort()).toEqual(["AVI", "MED"]);
    expect(
      signals.every(
        (s) => s.learnerHash && !s.learnerHash.includes(thandeka.id) && s.ageBand === "15-17",
      ),
    ).toBe(true);

    expect(await claimSession(res.claimCode, thandeka.id)).toMatchObject({
      ok: true,
      alreadyLinked: true,
    });
    const other = await createLearner({ age: 17 });
    expect(await claimSession(res.claimCode, other.id)).toEqual({
      ok: false,
      code: "ALREADY_CLAIMED",
    });
    expect(await previewClaim(res.claimCode, other.id)).toMatchObject({
      ok: true,
      preview: { claimed: true, claimedByViewer: false },
    });
  });

  it("lets only one of two simultaneous claims win", async () => {
    const res = await simulatedSession();
    const [a, b] = await Promise.all([createLearner({ age: 19 }), createLearner({ age: 19 })]);
    const results = await Promise.all([
      claimSession(res.claimCode, a.id),
      claimSession(res.claimCode, b.id),
    ]);
    expect(results.filter((r) => r.ok)).toHaveLength(1);
    expect(results.filter((r) => !r.ok && r.code === "ALREADY_CLAIMED")).toHaveLength(1);
  });

  it("rejects expired, unknown and malformed codes", async () => {
    const res = await simulatedSession();
    const learner = await createLearner({ age: 18 });
    const after = new Date(new Date(res.expiresAt).getTime() + 1000);
    expect(await claimSession(res.claimCode, learner.id, after)).toEqual({
      ok: false,
      code: "CLAIM_EXPIRED",
    });
    expect(await previewClaim(res.claimCode, null, after)).toEqual({
      ok: false,
      code: "CLAIM_EXPIRED",
    });
    expect(await previewClaim("ZZZZZZ", null)).toMatchObject({ ok: false });
    expect(await previewClaim("bad!", null)).toEqual({ ok: false, code: "INVALID_CODE" });
  });
});
