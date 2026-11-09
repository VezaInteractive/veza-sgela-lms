import { describe, expect, it } from "vitest";
import { shiftMonth } from "./calendar-math";

describe("shiftMonth", () => {
  it("moves forward and back across year ends", () => {
    expect(shiftMonth(2026, 10, 1)).toBe("2026-12");
    expect(shiftMonth(2026, 11, 1)).toBe("2027-01");
    expect(shiftMonth(2026, 0, -1)).toBe("2025-12");
  });
});
