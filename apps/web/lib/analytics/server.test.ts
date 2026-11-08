import { describe, expect, it, vi } from "vitest";
import { createTracker, toRow } from "./server";

vi.mock("@/lib/logger", () => ({ logger: { error: vi.fn() } }));

describe("trackEvent", () => {
  it("maps events to rows with defaults", () => {
    const now = new Date("2026-11-08T10:00:00Z");
    expect(toRow({ name: "page_view" }, now)).toEqual({
      name: "page_view",
      props: {},
      userId: null,
      anonId: null,
      requestId: null,
      occurredAt: now,
    });
  });

  it("writes a batch", async () => {
    const write = vi.fn().mockResolvedValue(undefined);
    const track = createTracker(write);
    await expect(track([{ name: "claim_started", props: { code: "K7Q4MX" } }])).resolves.toBe(true);
    expect(write).toHaveBeenCalledOnce();
    expect(write.mock.calls[0]?.[0][0]).toMatchObject({
      name: "claim_started",
      props: { code: "K7Q4MX" },
    });
  });

  it("never throws when the writer fails", async () => {
    const track = createTracker(() => Promise.reject(new Error("db down")));
    await expect(track([{ name: "page_view" }])).resolves.toBe(false);
  });
});
