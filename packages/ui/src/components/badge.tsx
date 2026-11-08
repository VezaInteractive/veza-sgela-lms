import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../cn";

export const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",
  {
    variants: {
      tone: {
        lime: "bg-lime-500 text-ink",
        neutral: "bg-surface-raised text-foreground border border-border",
        AVI: "bg-avi text-ink",
        ENG: "bg-eng text-ink",
        CUL: "bg-cul text-ink",
        MED: "bg-med text-ink",
        AGR: "bg-agr text-ink",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}
