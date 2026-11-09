import { TrendingUp, type LucideIcon } from "lucide-react";

export interface AdminStat {
  label: string;
  value: string;
  icon: LucideIcon;
  accent: string;
  /** Optional sub-figure, e.g. a share or a count ("38% of learners"). */
  note?: string;
}

/** Premium KPI cards (D-038): gradient fill, corner glow, gem icon chip and a big number. */
export function AdminStatGrid({ stats }: { stats: AdminStat[] }) {
  return (
    <ul className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-5">
      {stats.map(({ label, value, icon: Icon, accent, note }) => (
        <li
          key={label}
          className="admin-stat flex flex-col gap-3"
          style={{ ["--w" as string]: accent }}
        >
          <span className="flex items-center justify-between">
            <span
              aria-hidden="true"
              className="admin-stat-chip flex size-11 items-center justify-center rounded-2xl"
            >
              <Icon className="size-5" />
            </span>
            {note ? (
              <span className="flex items-center gap-1 rounded-full bg-(--glass) px-2 py-0.5 text-[11px] font-semibold text-muted">
                <TrendingUp aria-hidden="true" className="size-3" />
                {note}
              </span>
            ) : null}
          </span>
          <span className="flex flex-col">
            <span className="font-heading text-3xl leading-none font-bold tabular-nums">
              {value}
            </span>
            <span className="mt-1.5 text-xs leading-tight font-medium text-muted">{label}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

/** Content card for admin panels: white surface, accent top edge and a dotted title. */
export function AdminCard({
  title,
  action,
  accent = "#ABCF37",
  children,
  className,
}: {
  title: string;
  action?: React.ReactNode;
  accent?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      style={{ ["--w" as string]: accent }}
      className={
        "glass panel-accent flex min-w-0 flex-col gap-4 rounded-2xl p-5 md:p-6 " + (className ?? "")
      }
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2.5 font-heading text-lg font-semibold">
          <span aria-hidden="true" className="panel-dot size-2 shrink-0 rounded-full" />
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}
