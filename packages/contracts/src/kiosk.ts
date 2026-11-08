import { z } from "zod";

/** Kiosk API schemas (PRD 12.3, docs/kiosk-api.md). */
export const WORLD_CODES = ["AVI", "ENG", "CUL", "MED", "AGR"] as const;
export type WorldCode = (typeof WORLD_CODES)[number];
export const HEADSET_MODELS = ["QUEST_3", "QUEST_2"] as const;

const pct = z.number().int().min(0).max(100);

export const rubricItemSchema = z.object({
  criterion: z.string().min(1).max(120),
  score: z.number().min(0),
  max: z.number().positive(),
});

export const vrResultSchema = z.object({
  worldCode: z.enum(WORLD_CODES),
  scenarioId: z.string().min(1).max(80),
  appVersion: z.string().min(1).max(40),
  headsetModel: z.enum(HEADSET_MODELS).optional(),
  score: pct,
  durationSec: z
    .number()
    .int()
    .min(0)
    .max(4 * 3600),
  accuracy: pct.optional(),
  safetyErrors: z.number().int().min(0).optional(),
  decisionScore: pct.optional(),
  completed: z.boolean(),
  rubric: z.array(rubricItemSchema).max(30).default([]),
  events: z.record(z.string(), z.unknown()).optional(),
});

export const createKioskSessionSchema = z
  .object({
    deviceId: z.string().min(1).max(64),
    expoEventId: z.string().min(1).max(64).optional(),
    startedAt: z.iso.datetime({ offset: true }),
    endedAt: z.iso.datetime({ offset: true }),
    ageBand: z.string().max(10).optional(),
    gradeBand: z.string().max(10).optional(),
    clarityPre: z.number().int().min(1).max(5).optional(),
    results: z.array(vrResultSchema).min(1).max(5),
  })
  .refine((v) => new Set(v.results.map((r) => r.worldCode)).size === v.results.length, {
    message: "Each world may appear once per session",
    path: ["results"],
  });

export type CreateKioskSession = z.infer<typeof createKioskSessionSchema>;
export type VrResultInput = z.infer<typeof vrResultSchema>;

export const heartbeatSchema = z.object({
  deviceId: z.string().min(1).max(64),
  appVersion: z.string().min(1).max(40),
  headsetModel: z.enum(HEADSET_MODELS).optional(),
  battery: pct.optional(),
  queueDepth: z.number().int().min(0).optional(),
});

export type KioskHeartbeat = z.infer<typeof heartbeatSchema>;

export interface CreateKioskSessionResponse {
  sessionId: string;
  claimCode: string;
  claimUrl: string;
  qrPngUrl: string;
  expiresAt: string;
}

export interface ApiError {
  error: { code: string; message: string; details?: unknown };
}
