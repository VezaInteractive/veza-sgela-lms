import { describe, expect, it } from "vitest";
import {
  CROCKFORD_ALPHABET,
  createKioskSessionSchema,
  formatClaimCode,
  generateClaimCode,
  maskPhone,
  normaliseClaimCode,
  normaliseSaMobile,
} from "./index";

describe("claim codes", () => {
  it("uses Crockford base32 without I, L, O, U", () => {
    expect(CROCKFORD_ALPHABET).toHaveLength(32);
    for (const ch of "ILOU") expect(CROCKFORD_ALPHABET).not.toContain(ch);
  });

  it("generates 6 valid characters", () => {
    for (let i = 0; i < 500; i++) {
      const code = generateClaimCode();
      expect(code).toMatch(/^[0-9A-HJKMNP-TV-Z]{6}$/);
      expect(normaliseClaimCode(code)).toBe(code);
    }
  });

  it("is driven by the injected random source", () => {
    expect(generateClaimCode(() => 31)).toBe("ZZZZZZ");
    expect(generateClaimCode(() => 0)).toBe("000000");
  });

  it("normalises case, hyphens, spaces and Crockford aliases", () => {
    expect(normaliseClaimCode("k7q-4mx")).toBe("K7Q4MX");
    expect(normaliseClaimCode(" K7Q 4MX ")).toBe("K7Q4MX");
    expect(normaliseClaimCode("I0L-OAB")).toBe("1010AB");
  });

  it("rejects wrong length, U and symbols", () => {
    expect(normaliseClaimCode("K7Q4M")).toBeNull();
    expect(normaliseClaimCode("K7Q4MXX")).toBeNull();
    expect(normaliseClaimCode("K7Q4MU")).toBeNull();
    expect(normaliseClaimCode("K7Q4M!")).toBeNull();
  });

  it("formats for display", () => {
    expect(formatClaimCode("K7Q4MX")).toBe("K7Q-4MX");
  });
});

describe("normaliseSaMobile", () => {
  it.each([
    ["0821234567", "+27821234567"],
    ["082 123 4567", "+27821234567"],
    ["+27 82 123 4567", "+27821234567"],
    ["27821234567", "+27821234567"],
    ["+27 (0)82 123-4567", "+27821234567"],
    ["0027821234567", "+27821234567"],
    ["0712345678", "+27712345678"],
    ["0601234567", "+27601234567"],
  ])("%s → %s", (input, want) => {
    expect(normaliseSaMobile(input)).toBe(want);
  });

  it.each(["0111234567", "082123456", "08212345678", "+44 7700 900123", "abc", ""])(
    "rejects %s",
    (input) => {
      expect(normaliseSaMobile(input)).toBeNull();
    },
  );

  it("masks", () => {
    expect(maskPhone("+27821234567")).toBe("+27 82 *** 4567");
  });
});

const session = {
  deviceId: "kd_01",
  startedAt: "2026-11-20T09:12:00+02:00",
  endedAt: "2026-11-20T09:27:40+02:00",
  results: [
    {
      worldCode: "AVI",
      scenarioId: "avi.preflight.v1",
      appVersion: "1.4.0",
      score: 78,
      durationSec: 410,
      completed: true,
    },
  ],
};

describe("createKioskSessionSchema", () => {
  it("accepts the minimal example and defaults rubric", () => {
    const parsed = createKioskSessionSchema.parse(session);
    expect(parsed.results[0]?.rubric).toEqual([]);
  });
  it("rejects duplicate worlds", () => {
    const dup = { ...session, results: [session.results[0], session.results[0]] };
    expect(createKioskSessionSchema.safeParse(dup).success).toBe(false);
  });
  it("rejects scores above 100 and unknown worlds", () => {
    const high = { ...session, results: [{ ...session.results[0], score: 101 }] };
    expect(createKioskSessionSchema.safeParse(high).success).toBe(false);
    const world = { ...session, results: [{ ...session.results[0], worldCode: "XYZ" }] };
    expect(createKioskSessionSchema.safeParse(world).success).toBe(false);
  });
});
