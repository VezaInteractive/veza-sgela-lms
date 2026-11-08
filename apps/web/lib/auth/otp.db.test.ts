import { describe, expect, it } from "vitest";
import { db, randomPhone } from "@/test/factories";
import { requestOtp, verifyOtp } from "./otp";
import { createDbSession, endAllSessions, findSessionByToken } from "./session";

function capture() {
  const sent: string[] = [];
  return {
    sent,
    sms: { send: async (_to: string, text: string) => (sent.push(text), { id: "t" }) },
  };
}
const codeFrom = (text: string) => text.match(/\d{6}/)![0];
const T0 = new Date("2030-01-01T08:00:00Z");
const at = (sec: number) => new Date(T0.getTime() + sec * 1000);

describe("phone OTP against the database", () => {
  it("signs up a new number, then signs it in, and codes are single use", async () => {
    const phone = randomPhone();
    const { sent, sms } = capture();
    const ip = "10.0.0." + Math.floor(Math.random() * 250);
    expect(
      await requestOtp({ phoneE164: phone, ip, sms, now: at(0), message: (c) => "code " + c }),
    ).toEqual({ ok: true });

    const code = codeFrom(sent[0]!);
    const first = await verifyOtp({ phoneE164: phone, code, now: at(10) });
    expect(first).toMatchObject({ ok: true, isNew: true });
    expect(await verifyOtp({ phoneE164: phone, code, now: at(11) })).toEqual({
      ok: false,
      code: "NO_CHALLENGE",
    });

    await requestOtp({ phoneE164: phone, ip, sms, now: at(60), message: (c) => "code " + c });
    const again = await verifyOtp({ phoneE164: phone, code: codeFrom(sent[1]!), now: at(70) });
    expect(again).toMatchObject({ ok: true, isNew: false });
    const challenge = await db.otpChallenge.findFirst({
      where: { phoneE164: phone },
      orderBy: { createdAt: "desc" },
    });
    expect(challenge?.purpose).toBe("SIGN_IN");
    expect(challenge?.codeHash).not.toContain(codeFrom(sent[1]!));
  });

  it("enforces 30 s resend, 5 attempts and 5-minute expiry", async () => {
    const phone = randomPhone();
    const { sent, sms } = capture();
    const ip = "10.1.0.1";
    await requestOtp({ phoneE164: phone, ip, sms, now: at(0), message: (c) => c });
    const tooSoon = await requestOtp({ phoneE164: phone, ip, sms, now: at(5), message: (c) => c });
    expect(tooSoon).toMatchObject({ ok: false, code: "RESEND_TOO_SOON", retryAfterSec: 25 });

    const good = codeFrom(sent[0]!);
    const wrong = good === "000000" ? "111111" : "000000";
    for (let i = 4; i >= 1; i--) {
      expect(await verifyOtp({ phoneE164: phone, code: wrong, now: at(10) })).toEqual({
        ok: false,
        code: "WRONG_CODE",
        attemptsLeft: i,
      });
    }
    expect(await verifyOtp({ phoneE164: phone, code: wrong, now: at(10) })).toEqual({
      ok: false,
      code: "TOO_MANY_ATTEMPTS",
    });
    expect(await verifyOtp({ phoneE164: phone, code: good, now: at(10) })).toEqual({
      ok: false,
      code: "TOO_MANY_ATTEMPTS",
    });

    await requestOtp({ phoneE164: phone, ip, sms, now: at(40), message: (c) => c });
    expect(
      await verifyOtp({ phoneE164: phone, code: codeFrom(sent[1]!), now: at(40 + 300) }),
    ).toEqual({
      ok: false,
      code: "EXPIRED",
    });
  });

  it("limits sends to 5 per number per hour", async () => {
    const phone = randomPhone();
    const { sms } = capture();
    for (let i = 0; i < 5; i++) {
      expect(
        await requestOtp({
          phoneE164: phone,
          ip: "10.2.0." + i,
          sms,
          now: at(i * 60),
          message: (c) => c,
        }),
      ).toEqual({ ok: true });
    }
    expect(
      await requestOtp({ phoneE164: phone, ip: "10.2.0.9", sms, now: at(330), message: (c) => c }),
    ).toMatchObject({
      ok: false,
      code: "PHONE_RATE_LIMITED",
    });
  });
});

describe("database sessions", () => {
  it("stores only a hash, expires, and supports log out everywhere", async () => {
    const user = await db.user.create({ data: { phoneE164: randomPhone() } });
    const a = await createDbSession(user.id, { trusted: true, now: T0 });
    const b = await createDbSession(user.id, { trusted: false, now: new Date() });
    expect(await db.authSession.count({ where: { sessionToken: a.token } })).toBe(0);
    expect(a.expiresAt.getTime() - T0.getTime()).toBe(30 * 24 * 60 * 60_000);
    expect(await findSessionByToken(b.token)).not.toBeNull();
    expect(await findSessionByToken(a.token, new Date(a.expiresAt.getTime() + 1))).toBeNull();
    expect(await endAllSessions(user.id)).toBe(2);
    expect(await findSessionByToken(b.token)).toBeNull();
  });
});
