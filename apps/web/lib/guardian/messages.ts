import { createTranslator } from "next-intl";
import en from "@/messages/en.json";
import st from "@/messages/st.json";
import zu from "@/messages/zu.json";
import { isLocale } from "@/i18n/config";

const DICTS = { en, zu, st } as const;

/** SMS copy outside a request (jobs, scripts): learner's locale with English fallback. */
export function smsTranslator(locale: string) {
  const loc = isLocale(locale) ? locale : "en";
  const messages = { ...en.sms, ...(DICTS[loc] as { sms?: Partial<typeof en.sms> }).sms };
  return createTranslator({ locale: loc, messages: { sms: messages }, namespace: "sms" });
}

export function localeFromLang(lang: string): string {
  return lang.toLowerCase();
}
