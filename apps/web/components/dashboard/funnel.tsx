/**
 * Ordered funnel (D-028): one hue for magnitude, step names and counts in text, and the
 * step-to-step conversion where it is meaningful (<= 100%; steps counted per view can exceed
 * the step before, so no rate is shown there rather than a misleading one).
 */
export function Funnel({
  steps,
  ofPrevious,
}: {
  steps: { label: string; count: number }[];
  ofPrevious: (pct: number) => string;
}) {
  const max = Math.max(1, ...steps.map((s) => s.count));
  return (
    <ol className="flex flex-col gap-3">
      {steps.map((s, i) => {
        const prev = i > 0 ? steps[i - 1]!.count : null;
        const rate = prev && s.count <= prev ? Math.round((s.count / prev) * 100) : null;
        return (
          <li key={s.label} className="grid grid-cols-[2rem_minmax(0,1fr)] items-center gap-x-3">
            <span
              aria-hidden="true"
              className="row-span-2 flex size-8 items-center justify-center rounded-full bg-surface-raised text-xs font-bold text-muted"
            >
              {i + 1}
            </span>
            <span className="flex items-baseline justify-between gap-3 text-sm">
              <span className="font-semibold">{s.label}</span>
              <span className="flex items-baseline gap-2">
                {rate !== null ? (
                  <span className="text-xs text-muted">{ofPrevious(rate)}</span>
                ) : null}
                <span className="font-heading text-base font-bold tabular-nums">
                  {s.count.toLocaleString("en-ZA")}
                </span>
              </span>
            </span>
            <span className="mt-1.5 h-3 w-full overflow-hidden rounded-full bg-surface-raised">
              <span
                aria-hidden="true"
                className="block h-full rounded-full bg-linear-to-r from-primary/70 to-primary"
                style={{ width: `${Math.max(2, (s.count / max) * 100)}%` }}
              />
            </span>
          </li>
        );
      })}
    </ol>
  );
}
