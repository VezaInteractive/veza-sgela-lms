import type { EventName, EventProps } from "@sgela/analytics";
import { logger } from "@/lib/logger";

export interface ServerEvent {
  name: EventName;
  props?: EventProps;
  userId?: string;
  anonId?: string;
  requestId?: string;
  occurredAt?: Date;
}

export interface EventRow {
  name: string;
  props: EventProps;
  userId: string | null;
  anonId: string | null;
  requestId: string | null;
  occurredAt: Date;
}

export type EventWriter = (rows: EventRow[]) => Promise<void>;

export function toRow(e: ServerEvent, now: Date = new Date()): EventRow {
  return {
    name: e.name,
    props: e.props ?? {},
    userId: e.userId ?? null,
    anonId: e.anonId ?? null,
    requestId: e.requestId ?? null,
    occurredAt: e.occurredAt ?? now,
  };
}

/** Builds a tracker. Analytics must never break the user action, so failures are logged, not thrown. */
export function createTracker(write: EventWriter) {
  return async function trackEvents(events: ServerEvent[]): Promise<boolean> {
    if (events.length === 0) return true;
    try {
      await write(events.map((e) => toRow(e)));
      return true;
    } catch (err) {
      logger.error({ err, count: events.length }, "analytics write failed");
      return false;
    }
  };
}

const dbWriter: EventWriter = async (rows) => {
  const { getDb } = await import("@sgela/db");
  await getDb().event.createMany({ data: rows });
};

export const trackEvents = createTracker(dbWriter);

/** Server-side tracking helper (M0-5). */
export function trackEvent(event: ServerEvent) {
  return trackEvents([event]);
}
