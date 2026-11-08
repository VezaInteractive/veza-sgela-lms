import { describe, expect, it } from "vitest";
import { DISTRICTS, PROVINCES, districtsForProvince, isDistrictInProvince } from "./index";

describe("geo", () => {
  it("has the 52 district and metro municipalities", () => {
    expect(DISTRICTS).toHaveLength(52);
    expect(DISTRICTS.filter((x) => x.metro)).toHaveLength(8);
    expect(new Set(DISTRICTS.map((x) => x.code)).size).toBe(52);
  });

  it("gives every province its districts", () => {
    const counts = Object.fromEntries(
      PROVINCES.map((p) => [p.code, districtsForProvince(p.code).length]),
    );
    expect(counts).toEqual({ EC: 8, FS: 5, GP: 5, KZN: 11, LP: 5, MP: 3, NC: 5, NW: 4, WC: 6 });
  });

  it("checks district belongs to province", () => {
    expect(isDistrictInProvince("DC34", "LP")).toBe(true);
    expect(isDistrictInProvince("DC34", "GP")).toBe(false);
    expect(isDistrictInProvince("NOPE", "GP")).toBe(false);
  });
});
