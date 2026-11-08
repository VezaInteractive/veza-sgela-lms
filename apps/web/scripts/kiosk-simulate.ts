/**
 * pnpm kiosk:simulate --world AVI,MED --score 78,66 [--count 2] [--event <expoEventId>]
 *
 * Creates simulated expo sessions (results marked simulated: true, D-008) through the same
 * service the kiosk API uses, then prints claim URLs. Unity has no scoring yet, so this is the
 * expo data source for demos and tests (M1-7).
 */
import { parseArgs } from "node:util";
import {
  WORLD_CODES,
  createKioskSessionSchema,
  formatClaimCode,
  type WorldCode,
} from "@sgela/contracts";
import { getDb } from "@sgela/db";
import { createExpoSession, newDeviceKey } from "@/lib/kiosk/service";

const SIM_DEVICE_ID = "kd_simulator";
const SCENARIOS: Record<WorldCode, string> = {
  AVI: "avi.preflight.v1",
  ENG: "eng.panel.v1",
  CUL: "cul.kitchen.v1",
  MED: "med.ward.v1",
  AGR: "agr.smartfarm.v1",
};

function fail(message: string): never {
  console.error("kiosk:simulate: " + message);
  process.exit(1);
}

async function main() {
  const { values } = parseArgs({
    options: {
      world: { type: "string", default: "AVI,MED" },
      score: { type: "string" },
      count: { type: "string", default: "1" },
      event: { type: "string" },
    },
    allowPositionals: false,
  });
  const worlds = values.world!.split(",").map((w) => w.trim().toUpperCase());
  for (const w of worlds) {
    if (!(WORLD_CODES as readonly string[]).includes(w))
      fail("unknown world " + w + " (use " + WORLD_CODES.join(",") + ")");
  }
  const scores = values.score ? values.score.split(",").map((s) => Number(s.trim())) : [];
  if (scores.length > 0 && scores.length !== worlds.length)
    fail("--score needs one value per --world");
  if (scores.some((s) => !Number.isInteger(s) || s < 0 || s > 100))
    fail("scores must be whole numbers 0-100");
  const count = Number(values.count);
  if (!Number.isInteger(count) || count < 1 || count > 200) fail("--count must be 1-200");

  const db = getDb();
  const existing = await db.kioskDevice.findUnique({ where: { id: SIM_DEVICE_ID } });
  if (!existing) {
    await db.kioskDevice.create({
      data: {
        id: SIM_DEVICE_ID,
        label: "Simulator (kiosk:simulate)",
        apiKeyHash: newDeviceKey("test").hash,
        headsetModel: "QUEST_3",
      },
    });
  }

  for (let i = 0; i < count; i++) {
    const end = new Date();
    const start = new Date(end.getTime() - worlds.length * 10 * 60_000);
    const payload = createKioskSessionSchema.parse({
      deviceId: SIM_DEVICE_ID,
      expoEventId: values.event,
      startedAt: start.toISOString(),
      endedAt: end.toISOString(),
      results: worlds.map((w, idx) => {
        const score = scores[idx] ?? 40 + Math.floor(Math.random() * 55);
        return {
          worldCode: w,
          scenarioId: SCENARIOS[w as WorldCode],
          appVersion: "sim-0.1.0",
          headsetModel: "QUEST_3",
          score,
          durationSec: 540 + Math.floor(Math.random() * 120),
          accuracy: Math.min(100, score + 4),
          safetyErrors: score > 80 ? 0 : 1,
          decisionScore: Math.max(0, score - 3),
          completed: true,
          rubric: [{ criterion: "Simulated overall", score: Math.round(score / 10), max: 10 }],
        };
      }),
    });
    const res = await createExpoSession(SIM_DEVICE_ID, payload, { simulated: true });
    const summary = payload.results.map((r) => r.worldCode + " " + r.score).join(", ");
    console.info(
      "[" + (i + 1) + "/" + count + "] " + formatClaimCode(res.claimCode) + "  " + summary,
    );
    console.info("    claim: " + res.claimUrl);
    console.info("    qr:    " + res.qrPngUrl);
  }
  await db.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
