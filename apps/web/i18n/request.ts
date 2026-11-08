import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale } from "./config";

export default getRequestConfig(async () => {
  const store = await cookies();
  const fromCookie = store.get(LOCALE_COOKIE)?.value;
  const locale = isLocale(fromCookie) ? fromCookie : DEFAULT_LOCALE;
  const messages = (await import("../messages/" + locale + ".json")).default;
  // Fall back to English for keys not yet translated (zu/st cover onboarding, consent, nav).
  const en = locale === "en" ? messages : (await import("../messages/en.json")).default;
  return { locale, messages: deepMerge(en, messages) };
});

type Dict = { [k: string]: string | Dict };
function deepMerge(base: Dict, over: Dict): Dict {
  const out: Dict = { ...base };
  for (const [k, v] of Object.entries(over)) {
    const b = out[k];
    out[k] = typeof v === "object" && typeof b === "object" ? deepMerge(b, v) : v;
  }
  return out;
}
