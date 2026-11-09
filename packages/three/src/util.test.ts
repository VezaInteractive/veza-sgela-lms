import { describe, expect, it } from "vitest";
import { compassLayout, formatBytes, hasWebGL } from "./util";

describe("3D helpers", () => {
  it("formats sizes for the size gate", () => {
    expect(formatBytes(512)).toBe("512 B");
    expect(formatBytes(19_456)).toBe("19 KB");
    expect(formatBytes(1_468_006)).toBe("1.4 MB");
  });

  it("reports no WebGL on the server", () => {
    expect(hasWebGL()).toBe(false);
  });

  it("puts worlds on a pentagon and grows nodes with interest", () => {
    const nodes = compassLayout([
      { code: "AVI", interest: 0 },
      { code: "ENG", interest: 100 },
      { code: "CUL", interest: 50 },
      { code: "MED", interest: 140 },
      { code: "AGR", interest: -5 },
    ]);
    expect(nodes).toHaveLength(5);
    for (const n of nodes) expect(Math.hypot(n.x, n.z)).toBeCloseTo(2.2);
    expect(nodes[0]!.x).toBeCloseTo(0);
    expect(nodes[1]!.radius).toBeGreaterThan(nodes[2]!.radius);
    expect(nodes[2]!.radius).toBeGreaterThan(nodes[0]!.radius);
    // Interest is clamped to 0-100.
    expect(nodes[3]!.radius).toBeCloseTo(nodes[1]!.radius);
    expect(nodes[4]!.radius).toBeCloseTo(nodes[0]!.radius);
  });
});
