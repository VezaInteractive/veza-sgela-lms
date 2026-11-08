"use client";

import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { cn } from "@sgela/ui";

const STEPS = [
  { key: "phone", paths: ["/start"] },
  { key: "verify", paths: ["/start/verify"] },
  { key: "profile", paths: ["/start/profile"] },
  { key: "consent", paths: ["/start/guardian", "/start/consent"] },
] as const;

/** Vertical sign-up stepper for the brand panel (reference screens 2-5). */
export function SignupSteps() {
  const pathname = usePathname();
  const t = useTranslations("start.steps");
  if (!pathname.startsWith("/start")) return null;
  const current =
    pathname === "/start/done"
      ? STEPS.length
      : STEPS.findIndex((s) => s.paths.some((p) => p === pathname));
  return (
    <ol aria-label={t("title")} className="flex flex-col">
      {STEPS.map((s, i) => {
        const state = i < current ? "done" : i === current ? "current" : "todo";
        return (
          <li key={s.key} className="flex gap-4">
            <span className="flex flex-col items-center">
              <span
                className={cn(
                  "flex size-9 items-center justify-center rounded-full border-2 font-heading text-sm font-bold",
                  state === "done" && "border-lime-500 bg-lime-500 text-ink",
                  state === "current" &&
                    "border-lime-500 text-lime-300 shadow-[0_0_20px_-4px_var(--color-lime-500)]",
                  state === "todo" && "border-white/25 text-white/70",
                )}
              >
                {state === "done" ? <Check aria-hidden="true" className="size-4" /> : i + 1}
              </span>
              {i < STEPS.length - 1 ? (
                <span
                  aria-hidden="true"
                  className={cn("h-8 w-0.5", i < current ? "bg-lime-500" : "bg-white/20")}
                />
              ) : null}
            </span>
            <span className="flex flex-col pt-1.5">
              <span className="text-xs font-semibold tracking-wider text-white/70 uppercase">
                {t("label", { n: i + 1 })}
              </span>
              <span
                aria-current={state === "current" ? "step" : undefined}
                className={cn("font-semibold", state === "todo" ? "text-white/75" : "text-white")}
              >
                {t(s.key)}
              </span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
