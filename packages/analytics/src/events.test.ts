import { describe, expect, it } from "vitest";
import { EVENT_NAMES, FUNNEL_EVENTS, isEventName } from "./events";

describe("analytics events", () => {
  it("has unique names", () => {
    expect(new Set(EVENT_NAMES).size).toBe(EVENT_NAMES.length);
  });
  it("keeps funnel order from PRD §2.4", () => {
    expect(FUNNEL_EVENTS[0]).toBe("expo_session");
    expect(FUNNEL_EVENTS.at(-1)).toBe("placed");
  });
  it("validates names", () => {
    expect(isEventName("page_view")).toBe(true);
    expect(isEventName("nope")).toBe(false);
  });
});
