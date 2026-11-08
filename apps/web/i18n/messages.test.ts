import { describe, expect, it } from "vitest";
import en from "../messages/en.json";
import zu from "../messages/zu.json";
import st from "../messages/st.json";

// Namespaces that must be fully translated in zu/st (CLAUDE.md: onboarding, consent, nav).
const REQUIRED = [
  "nav",
  "settings",
  "coach",
  "worlds",
  "sms",
  "start",
  "profile",
  "errors",
  "guardian",
  "consent",
  "claim",
  "me",
  "privacy",
] as const;

function keys(obj: object, prefix = ""): string[] {
  return Object.entries(obj).flatMap(([k, v]) =>
    typeof v === "object" && v !== null ? keys(v, prefix + k + ".") : [prefix + k],
  );
}

describe.each([
  ["zu", zu],
  ["st", st],
])("%s messages", (_name, dict) => {
  it.each(REQUIRED)("translates every %s key", (ns) => {
    const want = keys((en as Record<string, object>)[ns] ?? {});
    const have = keys((dict as Record<string, object>)[ns] ?? {});
    expect(have.sort()).toEqual(want.sort());
  });

  it("has no keys that are missing from en", () => {
    const enKeys = new Set(keys(en));
    expect(keys(dict).filter((k) => !enKeys.has(k))).toEqual([]);
  });
});
