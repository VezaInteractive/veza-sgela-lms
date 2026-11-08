import { afterEach, describe, expect, it, vi } from "vitest";
import { createLearner, db, fakeSenders, randomPhone } from "@/test/factories";
import { ConsentError, loadConsentState, recordConsents } from "@/lib/consent/service";
import { findMatchableLearnerIds } from "@/lib/matching/candidates";
import { dueReminder, inviteGuardian, respondAsGuardian, runGuardianReminders } from "./service";

const HOUR = 60 * 60_000;

afterEach(() => {
  vi.useRealTimers();
});

describe("dueReminder (fake clock)", () => {
  const base = {
    requestedAt: new Date("2030-03-01T08:00:00Z"),
    remindersSent: 0,
    respondedAt: null,
    tokenExpiresAt: new Date("2030-04-01T08:00:00Z"),
    learner: { restricted: true },
  };
  const at = (h: number) => new Date(base.requestedAt.getTime() + h * HOUR);

  it("is due at 48 h and 7 d, not before", () => {
    expect(dueReminder(base, at(47.9))).toBeNull();
    expect(dueReminder(base, at(48))).toBe(1);
    expect(dueReminder({ ...base, remindersSent: 1 }, at(167))).toBeNull();
    expect(dueReminder({ ...base, remindersSent: 1 }, at(168))).toBe(2);
    expect(dueReminder({ ...base, remindersSent: 2 }, at(500))).toBeNull();
  });

  it("skips answered, unrestricted or expired requests", () => {
    expect(dueReminder({ ...base, respondedAt: at(1) }, at(48))).toBeNull();
    expect(dueReminder({ ...base, learner: { restricted: false } }, at(48))).toBeNull();
    expect(dueReminder({ ...base, tokenExpiresAt: at(40) }, at(48))).toBeNull();
  });

  it("sends only the latest reminder after downtime", () => {
    expect(dueReminder(base, at(200))).toBe(2);
  });
});

describe("guardian flow and restricted mode", () => {
  it("keeps a 16-year-old restricted and unmatchable until the guardian consents", async () => {
    const learner = await createLearner({ age: 16 });
    const adult = await createLearner({ age: 22 });
    await recordConsents({
      learnerId: adult.id,
      actor: "LEARNER",
      locale: "en",
      choices: { PLATFORM: true, MATCHING: true },
    });

    // The learner cannot grant on their own behalf.
    await expect(
      recordConsents({
        learnerId: learner.id,
        actor: "LEARNER",
        locale: "en",
        choices: { MATCHING: true },
      }),
    ).rejects.toBeInstanceOf(ConsentError);

    const { sent, senders } = fakeSenders();
    const { token } = await inviteGuardian({
      learnerId: learner.id,
      name: "Mme Dikeledi",
      phoneE164: randomPhone(),
      senders,
    });
    expect(sent[0]?.text).toContain("/consent/" + token);

    const ids = [learner.id, adult.id];
    expect(await findMatchableLearnerIds({ learnerIds: ids })).toEqual([adult.id]);
    expect((await db.learner.findUniqueOrThrow({ where: { id: learner.id } })).restricted).toBe(
      true,
    );

    const res = await respondAsGuardian({
      token,
      agree: true,
      choices: { PLATFORM: true, MATCHING: true, PARTNER_CONTACT: false },
      locale: "st",
      ip: "196.25.1.1",
    });
    expect(res).toMatchObject({ ok: true, restricted: false });
    expect((await findMatchableLearnerIds({ learnerIds: ids })).sort()).toEqual(ids.sort());

    const rows = await db.consent.findMany({ where: { learnerId: learner.id } });
    expect(rows.every((r) => r.grantedBy === "GUARDIAN" && r.language === "ST" && r.ipHash)).toBe(
      true,
    );
    expect(rows.some((r) => r.ipHash?.includes("196.25"))).toBe(false);

    // The learner may still withdraw matching; latest row wins.
    await recordConsents({
      learnerId: learner.id,
      actor: "LEARNER",
      locale: "en",
      choices: { MATCHING: false },
    });
    expect(await findMatchableLearnerIds({ learnerIds: [learner.id] })).toEqual([]);
    expect((await loadConsentState(learner)).PLATFORM.granted).toBe(true);
  });

  it("a guardian decline keeps the learner restricted", async () => {
    const learner = await createLearner({ age: 15 });
    const { senders } = fakeSenders();
    const { token } = await inviteGuardian({
      learnerId: learner.id,
      name: "Ntate Sello",
      phoneE164: randomPhone(),
      senders,
    });
    const res = await respondAsGuardian({
      token,
      agree: false,
      choices: { PLATFORM: true, MATCHING: true, PARTNER_CONTACT: true },
      locale: "en",
    });
    expect(res).toMatchObject({ ok: true, restricted: true });
    expect(await findMatchableLearnerIds({ learnerIds: [learner.id] })).toEqual([]);
  });

  it("rejects unknown and expired tokens", async () => {
    const learner = await createLearner({ age: 14 });
    const { senders } = fakeSenders();
    const now = new Date("2030-05-01T08:00:00Z");
    const { token } = await inviteGuardian({
      learnerId: learner.id,
      name: "Gogo",
      phoneE164: randomPhone(),
      senders,
      now,
    });
    const later = new Date(now.getTime() + 31 * 24 * HOUR);
    expect(
      await respondAsGuardian({
        token,
        agree: true,
        choices: { PLATFORM: true, MATCHING: true, PARTNER_CONTACT: true },
        locale: "en",
        now: later,
      }),
    ).toEqual({
      ok: false,
      code: "INVALID_TOKEN",
    });
    expect(
      await respondAsGuardian({
        token: "x".repeat(43),
        agree: true,
        choices: { PLATFORM: true, MATCHING: true, PARTNER_CONTACT: true },
        locale: "en",
      }),
    ).toMatchObject({ ok: false });
  });

  it("consent rows are append-only in the database", async () => {
    const learner = await createLearner({ age: 20 });
    await recordConsents({
      learnerId: learner.id,
      actor: "LEARNER",
      locale: "en",
      choices: { PLATFORM: true },
    });
    const row = await db.consent.findFirstOrThrow({ where: { learnerId: learner.id } });
    await expect(
      db.consent.update({ where: { id: row.id }, data: { granted: false } }),
    ).rejects.toThrow();
  });
});

describe("guardian.reminders job (fake clock)", () => {
  it("sends at 48 h and 7 d exactly once each, with the same link", async () => {
    const requestedAt = new Date("2030-06-01T08:00:00Z");
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(requestedAt);

    const learner = await createLearner({ age: 16, firstName: "Lerato" });
    const invite = fakeSenders();
    const { token } = await inviteGuardian({
      learnerId: learner.id,
      name: "Mme Palesa",
      phoneE164: randomPhone(),
      senders: invite.senders,
    });
    const { sent, senders } = fakeSenders();
    const mine = () => sent.filter((m) => m.text.includes(token));

    vi.setSystemTime(new Date(requestedAt.getTime() + 47 * HOUR));
    await runGuardianReminders({ senders });
    expect(mine()).toHaveLength(0);

    vi.setSystemTime(new Date(requestedAt.getTime() + 48 * HOUR));
    await runGuardianReminders({ senders });
    await runGuardianReminders({ senders });
    expect(mine()).toHaveLength(1);
    expect(mine()[0]?.text).toContain("Lerato");

    vi.setSystemTime(new Date(requestedAt.getTime() + 7 * 24 * HOUR));
    await runGuardianReminders({ senders });
    expect(mine()).toHaveLength(2);

    vi.setSystemTime(new Date(requestedAt.getTime() + 20 * 24 * HOUR));
    await runGuardianReminders({ senders });
    expect(mine()).toHaveLength(2);
    const g = await db.guardian.findUniqueOrThrow({ where: { learnerId: learner.id } });
    expect(g.remindersSent).toBe(2);
  });
});
