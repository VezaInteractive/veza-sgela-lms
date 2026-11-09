import { headers } from "next/headers";

/**
 * True when the browser asks for less data (`Save-Data: on`, sent by Chrome Lite mode and
 * many Android data-saver settings). Pages then skip decorative photos (CLAUDE.md: data-saver aware).
 */
export async function wantsLessData(): Promise<boolean> {
  const h = await headers();
  return h.get("save-data")?.toLowerCase() === "on";
}
