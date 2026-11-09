import { getTranslations } from "next-intl/server";
import { ChevronDown, CircleHelp } from "lucide-react";
import { PageIntro } from "@/components/dashboard/parts";

export async function generateMetadata() {
  return { title: (await getTranslations("help"))("title") };
}

const FAQS = ["sms", "results", "guardian", "photo", "privacy", "data"] as const;

/** Help and FAQs (D-027), linked from the Support pill. Native <details>, works without JS. */
export default async function HelpPage() {
  const t = await getTranslations("help");
  return (
    <section className="mx-auto flex max-w-3xl flex-col gap-6">
      <PageIntro title={t("title")} intro={t("intro")} />
      <ul className="flex flex-col gap-3">
        {FAQS.map((k) => (
          <li key={k}>
            <details className="glass group rounded-2xl p-5 open:pb-6">
              <summary className="flex cursor-pointer list-none items-center gap-3 font-semibold">
                <CircleHelp aria-hidden="true" className="size-5 shrink-0 text-link" />
                <span className="flex-1">{t(`faqs.${k}.q`)}</span>
                <ChevronDown
                  aria-hidden="true"
                  className="size-4 shrink-0 transition-transform group-open:rotate-180"
                />
              </summary>
              <p className="mt-3 pl-8 text-muted">{t(`faqs.${k}.a`)}</p>
            </details>
          </li>
        ))}
      </ul>
    </section>
  );
}
