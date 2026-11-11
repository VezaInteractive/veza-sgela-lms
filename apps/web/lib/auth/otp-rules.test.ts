import { describe, expect, it } from "vitest";
import { checkSendAllowed, evaluateVerify, generateOtpCode, type OtpLimits } from "./otp-rules";

const limits: OtpLimits = {
  ttlMs: 5 * 60_000,
  maxAttempts: 5,
  resendAfterMs: 30_000,
  maxSendsPerIdentityPerHour: 5,
  maxSendsPerIpPerHour: 20,
};
const T0 = new Date("2026-11-20T09:00:00Z");
const at = (sec: number) => new Date(T0.getTime() + sec * 1000);

describe("OTP code", () => {
  it("is always 6 digits", () => {
    expect(generateOtpCode(() => 42)).toBe("000042");
    expect(generateOtpCode(() => 999_999)).toBe("999999");
    for (let i = 0; i < 200; i++) expect(generateOtpCode()).toMatch(/^\d{6}$/);
  });
});

describe("send limits", () => {
  it("allows the first send", () => {
    expect(checkSendAllowed({ identitySends: [], ipSends: [] }, T0, limits)).toEqual({ ok: true });
  });

  it("blocks resend within 30 s and allows it after", () => {
    const h = { identitySends: [T0], ipSends: [T0] };
    expect(checkSendAllowed(h, at(29), limits)).toEqual({
      ok: false,
      code: "RESEND_TOO_SOON",
      retryAfterSec: 1,
    });
    expect(checkSendAllowed(h, at(30), limits)).toEqual({ ok: true });
  });

  it("allows 5 sends per number per hour, then blocks until the oldest ages out", () => {
    const sends = [0, 60, 120, 180, 240].map(at);
    const h = { identitySends: sends, ipSends: sends };
    const blocked = checkSendAllowed(h, at(300), limits);
    expect(blocked).toMatchObject({ ok: false, code: "IDENTITY_RATE_LIMITED" });
    expect(blocked.ok === false && blocked.retryAfterSec).toBe(3300);
    expect(checkSendAllowed(h, at(3601), limits)).toEqual({ ok: true });
  });

  it("allows 20 sends per IP per hour", () => {
    const ipSends = Array.from({ length: 20 }, (_, i) => at(i * 10));
    expect(checkSendAllowed({ identitySends: [], ipSends }, at(300), limits)).toMatchObject({
      ok: false,
      code: "IP_RATE_LIMITED",
    });
    expect(
      checkSendAllowed({ identitySends: [], ipSends: ipSends.slice(1) }, at(300), limits),
    ).toEqual({ ok: true });
  });
});

describe("verify", () => {
  const fresh = { attempts: 0, expiresAt: at(300), consumedAt: null };

  it("accepts a matching code inside the 5-minute TTL", () => {
    expect(evaluateVerify(fresh, true, at(299), limits)).toEqual({ ok: true });
  });

  it("expires at 5 minutes", () => {
    expect(evaluateVerify(fresh, true, at(300), limits)).toEqual({ ok: false, code: "EXPIRED" });
  });

  it("counts down attempts and locks on the 5th wrong code", () => {
    expect(evaluateVerify({ ...fresh, attempts: 0 }, false, at(1), limits)).toEqual({
      ok: false,
      code: "WRONG_CODE",
      attemptsLeft: 4,
    });
    expect(evaluateVerify({ ...fresh, attempts: 4 }, false, at(1), limits)).toEqual({
      ok: false,
      code: "TOO_MANY_ATTEMPTS",
    });
    expect(evaluateVerify({ ...fresh, attempts: 5 }, true, at(1), limits)).toEqual({
      ok: false,
      code: "TOO_MANY_ATTEMPTS",
    });
  });

  it("rejects consumed or missing challenges", () => {
    expect(evaluateVerify(null, true, at(1), limits)).toEqual({ ok: false, code: "NO_CHALLENGE" });
    expect(evaluateVerify({ ...fresh, consumedAt: at(0) }, true, at(1), limits)).toEqual({
      ok: false,
      code: "NO_CHALLENGE",
    });
  });
});
