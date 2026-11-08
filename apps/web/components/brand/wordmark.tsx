import { Compass } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { cn } from "@sgela/ui";

/** "Veza Sgela" wordmark: compass mark, small spaced VEZA over a bold Sgela. */
export async function Wordmark({
  tone = "default",
  className,
}: {
  tone?: "default" | "onDark";
  className?: string;
}) {
  const t = await getTranslations("app");
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <span
        aria-hidden="true"
        className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-ink shadow-[0_0_24px_-6px_var(--color-lime-500)]"
      >
        <Compass className="size-6" />
      </span>
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "text-[11px] font-bold tracking-[0.32em] uppercase",
            tone === "onDark" ? "text-lime-300" : "text-muted",
          )}
        >
          {t("org")}
        </span>
        <span
          className={cn(
            "font-heading text-2xl font-extrabold tracking-tight",
            tone === "onDark" ? "text-white" : "text-foreground",
          )}
        >
          {t("name")}
        </span>
      </span>
    </span>
  );
}
