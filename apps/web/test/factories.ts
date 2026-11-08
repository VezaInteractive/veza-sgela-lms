import { randomInt } from "node:crypto";
import { getDb } from "@sgela/db";

/** Test data helpers for DB integration tests. Fictional data only. */
export const db = getDb();

export function randomPhone(): string {
  return "+2782" + String(randomInt(0, 10_000_000)).padStart(7, "0");
}

export function dobForAge(age: number, now = new Date()): Date {
  return new Date(Date.UTC(now.getUTCFullYear() - age, 0, 15));
}

export async function createLearner(opts: {
  age: number;
  restricted?: boolean;
  firstName?: string;
}) {
  const user = await db.user.create({ data: { phoneE164: randomPhone() } });
  return db.learner.create({
    data: {
      userId: user.id,
      firstName: opts.firstName ?? "Thandeka",
      dateOfBirth: dobForAge(opts.age),
      provinceCode: "LP",
      districtCode: "DC34",
      inSchool: true,
      grade: 10,
      restricted: opts.restricted ?? true,
      notifyChannels: { inApp: true, sms: true, whatsapp: false },
      quietHours: { start: "20:00", end: "07:00" },
    },
  });
}

/** Captures messages instead of using the console providers. */
export function fakeSenders() {
  const sent: { to: string; text: string }[] = [];
  return {
    sent,
    senders: {
      sms: { send: async (to: string, text: string) => (sent.push({ to, text }), { id: "t" }) },
      whatsapp: { sendTemplate: async () => ({ id: "t" }) },
    },
  };
}
