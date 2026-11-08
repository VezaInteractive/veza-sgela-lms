import { describe, expect, it } from "vitest";
import { suppress } from "./service";

describe("aggregate suppression", () => {
  it("hides groups smaller than 20 and sorts visible groups first", () => {
    expect(
      suppress([
        { key: "LP", count: 19 },
        { key: "GP", count: 20 },
        { key: "KZN", count: 45 },
      ]),
    ).toEqual([
      { key: "KZN", value: 45 },
      { key: "GP", value: 20 },
      { key: "LP", value: null },
    ]);
  });
});
