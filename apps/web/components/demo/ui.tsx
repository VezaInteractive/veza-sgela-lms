import Link from "next/link";
import { cn } from "@sgela/ui";

/** Dashed "sample content" marker so demo data is never mistaken for real data (D-018). */
export function SampleNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="self-start rounded-full border border-dashed border-warning px-3 py-1 text-xs font-semibold text-muted">
      {children}
    </p>
  );
}

/** Match / score ring. Value is also printed in text, so colour is never the only cue. */
export function ScoreRing({
  value,
  label,
  size = 64,
}: {
  value: number;
  label: string;
  size?: number;
}) {
  const r = (size - 8) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(100, value));
  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      role="img"
      aria-label={label}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--border)"
          strokeWidth={6}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--primary)"
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={`${(v / 100) * c} ${c}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <span
        className="absolute inset-0 flex items-center justify-center font-heading text-base font-bold"
        aria-hidden="true"
      >
        {v}
      </span>
    </div>
  );
}

export function ProgressBar({ value, label }: { value: number; label: string }) {
  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className="h-2 w-full overflow-hidden rounded-full bg-surface-raised"
    >
      <div className="h-full rounded-full bg-primary" style={{ width: `${value}%` }} />
    </div>
  );
}

export interface BarRow {
  label: string;
  value: number | null;
  /** Shown instead of the bar when a cell is suppressed for privacy. */
  note?: string;
  href?: string;
}

/**
 * Horizontal bar list (dataviz: magnitude = one hue; identity = text label, never colour).
 * Each row is a real table row, so screen readers and the table view are the same thing.
 */
export function BarList({
  rows,
  caption,
  valueHeader,
}: {
  rows: BarRow[];
  caption: string;
  valueHeader: string;
}) {
  const max = Math.max(1, ...rows.map((r) => r.value ?? 0));
  return (
    <table className="w-full border-separate border-spacing-y-2 text-sm">
      <caption className="sr-only">{caption}</caption>
      <thead className="sr-only">
        <tr>
          <th scope="col">{caption}</th>
          <th scope="col">{valueHeader}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr
            key={r.label}
            title={r.value === null ? r.note : `${r.label}: ${r.value}`}
            className="group"
          >
            <th
              scope="row"
              className="w-40 min-w-32 pr-3 text-left font-medium md:w-56 md:min-w-56"
            >
              {r.href ? (
                <Link href={r.href} className="underline-offset-2 group-hover:underline">
                  {r.label}
                </Link>
              ) : (
                r.label
              )}
            </th>
            <td className="w-full">
              {r.value === null ? (
                <span className="text-xs text-muted italic">{r.note}</span>
              ) : (
                <span className="flex items-center gap-2">
                  <span
                    className={cn(
                      "block h-3 rounded-r-[4px] bg-linear-to-r from-primary/70 to-primary shadow-[0_0_12px_-4px_var(--primary)] transition-opacity group-hover:opacity-80",
                    )}
                    style={{ width: `${Math.max(2, (r.value / max) * 100)}%` }}
                    aria-hidden="true"
                  />
                  <span className="font-semibold tabular-nums">
                    {r.value.toLocaleString("en-ZA")}
                  </span>
                </span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function StatTile({
  label,
  value,
  hint,
  icon: Icon,
  accent = "#ABCF37",
}: {
  label: string;
  value: string;
  hint?: string;
  icon?: React.ComponentType<{ className?: string }>;
  /** Decorative icon tint only; the label carries meaning. */
  accent?: string;
}) {
  return (
    <div
      style={{ ["--w" as string]: accent }}
      className="world-tint lift flex flex-col gap-2 rounded-2xl p-4 md:p-5"
    >
      <span className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-muted">{label}</span>
        {Icon ? (
          <span
            aria-hidden="true"
            className="world-icon flex size-8 shrink-0 items-center justify-center rounded-lg"
          >
            <Icon className="size-4" />
          </span>
        ) : null}
      </span>
      <span className="font-heading text-3xl font-bold tabular-nums md:text-4xl">{value}</span>
      {hint ? <span className="text-xs text-muted">{hint}</span> : null}
    </div>
  );
}
