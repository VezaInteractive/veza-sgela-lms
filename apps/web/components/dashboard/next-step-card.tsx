import Link from "next/link";
import { ArrowRight, Compass } from "lucide-react";

/**
 * "Your next best step" card (L-HM-2): exactly one primary action, computed by the PRD 7.11
 * rules. Presentational; the page resolves the rule and its text. Lime band so it reads as the
 * one thing to do next.
 */
export function NextStepCard({
  label,
  title,
  body,
  cta,
  href,
}: {
  label: string;
  title: string;
  body: string;
  cta: string;
  href: string;
}) {
  return (
    <section className="next-step fade-up relative isolate overflow-hidden rounded-3xl p-6 md:p-7">
      <Compass
        aria-hidden="true"
        className="pointer-events-none absolute -right-6 -bottom-8 size-40 opacity-10"
      />
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 flex-col gap-1.5">
          <span className="text-xs font-semibold tracking-wide text-ink/70 uppercase">{label}</span>
          <h2 className="font-heading text-xl leading-tight font-bold text-ink md:text-2xl">
            {title}
          </h2>
          <p className="max-w-xl text-sm text-ink/80">{body}</p>
        </div>
        <Link
          href={href}
          className="inline-flex min-h-12 shrink-0 items-center gap-2 self-start rounded-full bg-ink px-5 font-semibold text-white shadow-lg transition-transform hover:translate-x-0.5"
        >
          {cta}
          <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      </div>
    </section>
  );
}
