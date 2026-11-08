import { describe, expect, it } from "vitest";
import { eventBatchSchema } from "./schema";

const ok = { name: "page_view", occurredAt: "2026-11-08T10:00:00+02:00" };

describe("event batch schema", () => {
  it("accepts a valid batch", () => {
    expect(eventBatchSchema.safeParse({ events: [ok] }).success).toBe(true);
  });
  it("rejects unknown event names", () => {
    expect(eventBatchSchema.safeParse({ events: [{ ...ok, name: "hack" }] }).success).toBe(false);
  });
  it("rejects nested props", () => {
    expect(
      eventBatchSchema.safeParse({ events: [{ ...ok, props: { a: { b: 1 } } }] }).success,
    ).toBe(false);
  });
  it("caps batch size at 50", () => {
    expect(eventBatchSchema.safeParse({ events: Array(51).fill(ok) }).success).toBe(false);
  });
});
