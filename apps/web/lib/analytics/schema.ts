import { z } from "zod";
import { EVENT_NAMES } from "@sgela/analytics";

const propValue = z.union([z.string().max(500), z.number(), z.boolean(), z.null()]);

export const eventSchema = z.object({
  name: z.enum(EVENT_NAMES),
  props: z.record(z.string().max(64), propValue).default({}),
  occurredAt: z.iso.datetime({ offset: true }),
  anonId: z.string().max(64).optional(),
});

export const eventBatchSchema = z.object({
  events: z.array(eventSchema).min(1).max(50),
});

export type EventInput = z.infer<typeof eventSchema>;
