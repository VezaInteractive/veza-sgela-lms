import { Heart } from "lucide-react";
import { cn } from "@sgela/ui";
import { toggleInterestAction } from "@/app/(learner)/explore/actions";

/**
 * "I'm interested" toggle (L-EX-4). A form post (works without JavaScript); the button keeps one
 * accessible name and exposes its state with aria-pressed.
 */
export function InterestToggle({
  industry,
  career,
  on,
  label,
  stateLabel,
  className,
}: {
  industry: string;
  career?: string;
  on: boolean;
  label: string;
  /** Visible text when on, e.g. "You're interested". */
  stateLabel: string;
  className?: string;
}) {
  return (
    <form action={toggleInterestAction} className={className}>
      <input type="hidden" name="industry" value={industry} />
      {career ? <input type="hidden" name="career" value={career} /> : null}
      <input type="hidden" name="on" value={on ? "0" : "1"} />
      <button
        type="submit"
        aria-pressed={on}
        aria-label={label}
        data-testid="interest-toggle"
        className={cn(
          "inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors",
          on
            ? "border-transparent bg-primary text-primary-foreground"
            : "border-border bg-surface hover:border-primary",
        )}
      >
        <Heart aria-hidden="true" className={cn("size-4", on && "fill-current")} />
        <span aria-hidden="true">{on ? stateLabel : label}</span>
      </button>
    </form>
  );
}
