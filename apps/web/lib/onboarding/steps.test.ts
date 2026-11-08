import { describe, expect, it } from "vitest";
import { ageOn, isMinor, onboardingPath } from "./steps";

const dob = (s: string) => new Date(s + "T00:00:00Z");

describe("ageOn", () => {
  it("counts birthdays in South African time", () => {
    // 23:30 UTC on 19 Nov is already 20 Nov in SAST.
    expect(ageOn(dob("2010-11-20"), new Date("2026-11-19T23:30:00Z"))).toBe(16);
    expect(ageOn(dob("2010-11-20"), new Date("2026-11-19T21:00:00Z"))).toBe(15);
  });
  it("detects minors", () => {
    expect(isMinor(dob("2008-11-21"), new Date("2026-11-20T10:00:00Z"))).toBe(true);
    expect(isMinor(dob("2008-11-20"), new Date("2026-11-20T10:00:00Z"))).toBe(false);
  });
});

describe("onboardingPath", () => {
  const now = new Date("2026-11-20T10:00:00Z");
  it("sends new users to the profile", () => {
    expect(onboardingPath(null, now)).toBe("/start/profile");
  });
  it("sends minors without a guardian to the guardian step, then lets them in restricted", () => {
    const minor = { dateOfBirth: dob("2010-05-01"), restricted: true, guardian: null };
    expect(onboardingPath(minor, now)).toBe("/start/guardian");
    expect(onboardingPath({ ...minor, guardian: {} }, now)).toBeNull();
  });
  it("sends adults to their own consent step until platform consent is given", () => {
    const adult = { dateOfBirth: dob("2000-05-01"), restricted: true, guardian: null };
    expect(onboardingPath(adult, now)).toBe("/start/consent");
    expect(onboardingPath({ ...adult, restricted: false }, now)).toBeNull();
  });
});
