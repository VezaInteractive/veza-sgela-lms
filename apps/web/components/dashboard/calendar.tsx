import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@sgela/ui";
import { shiftMonth } from "./calendar-math";

export interface CalendarEvent {
  id: string;
  /** Local date, YYYY-MM-DD (Africa/Johannesburg). */
  date: string;
  title: string;
  colour: string;
}

export interface CalendarLabels {
  title: string;
  prev: string;
  next: string;
  comingUp: string;
  none: string;
  today: string;
  /** e.g. "2 events" for screen readers. */
  eventsOn: (n: number) => string;
}

const pad = (n: number) => String(n).padStart(2, "0");
const iso = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;

/**
 * Compact month calendar for the Home rail. Weeks start on Monday (South African convention).
 * Days with events get coloured dots plus screen-reader text; "Coming up" lists the next three.
 * Month navigation is plain links (?month=YYYY-MM), so it works without JavaScript.
 */
export function MonthCalendar({
  year,
  month,
  today,
  events,
  locale,
  labels,
  hrefFor,
}: {
  year: number;
  month: number;
  today: string;
  events: CalendarEvent[];
  locale: string;
  labels: CalendarLabels;
  hrefFor: (ym: string) => string;
}) {
  const first = new Date(Date.UTC(year, month, 1));
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const lead = (first.getUTCDay() + 6) % 7; // Monday = 0
  const cells: (number | null)[] = [
    ...Array<null>(lead).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7) cells.push(null);
  const weeks = Array.from({ length: cells.length / 7 }, (_, w) => cells.slice(w * 7, w * 7 + 7));

  const monthName = new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(first);
  const weekday = new Intl.DateTimeFormat(locale, { weekday: "narrow", timeZone: "UTC" });
  const weekdayLong = new Intl.DateTimeFormat(locale, { weekday: "long", timeZone: "UTC" });
  // 2024-01-01 was a Monday.
  const dayHeads = Array.from({ length: 7 }, (_, i) => new Date(Date.UTC(2024, 0, 1 + i)));
  const short = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });

  const byDay = new Map<string, CalendarEvent[]>();
  for (const e of events) byDay.set(e.date, [...(byDay.get(e.date) ?? []), e]);
  const upcoming = events
    .filter((e) => e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 3);

  return (
    <section className="glass flex min-w-0 flex-col gap-4 rounded-2xl p-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-heading text-lg font-semibold">{labels.title}</h2>
        <div className="flex items-center gap-1">
          <Link
            href={hrefFor(shiftMonth(year, month, -1))}
            aria-label={labels.prev}
            className="flex size-8 items-center justify-center rounded-lg border border-border hover:border-primary"
          >
            <ChevronLeft aria-hidden="true" className="size-4" />
          </Link>
          <Link
            href={hrefFor(shiftMonth(year, month, 1))}
            aria-label={labels.next}
            className="flex size-8 items-center justify-center rounded-lg border border-border hover:border-primary"
          >
            <ChevronRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
      </div>

      <table className="w-full table-fixed border-separate border-spacing-y-1 text-center text-sm">
        <caption className="pb-2 text-left text-sm font-semibold text-muted">{monthName}</caption>
        <thead>
          <tr>
            {dayHeads.map((d) => (
              <th
                key={d.toISOString()}
                scope="col"
                abbr={weekdayLong.format(d)}
                className="pb-1 text-xs font-semibold text-muted"
              >
                {weekday.format(d)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, w) => (
            <tr key={w}>
              {week.map((day, i) => {
                if (day === null) return <td key={i} />;
                const key = iso(year, month, day);
                const dayEvents = byDay.get(key) ?? [];
                const isToday = key === today;
                return (
                  <td key={i} title={dayEvents.map((e) => e.title).join(", ") || undefined}>
                    <span
                      aria-current={isToday ? "date" : undefined}
                      className={cn(
                        "mx-auto flex size-9 flex-col items-center justify-center rounded-full tabular-nums",
                        isToday && "bg-primary font-bold text-primary-foreground",
                        !isToday && dayEvents.length > 0 && "font-semibold",
                      )}
                    >
                      {day}
                      {isToday ? <span className="sr-only"> ({labels.today})</span> : null}
                      {dayEvents.length > 0 ? (
                        <>
                          <span aria-hidden="true" className="mt-0.5 flex gap-0.5">
                            {dayEvents.slice(0, 3).map((e) => (
                              <span
                                key={e.id}
                                className="size-1.5 rounded-full"
                                style={{ background: isToday ? "#231F20" : e.colour }}
                              />
                            ))}
                          </span>
                          <span className="sr-only">, {labels.eventsOn(dayEvents.length)}</span>
                        </>
                      ) : null}
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex flex-col gap-2 border-t border-border pt-4">
        <h3 className="text-sm font-semibold">{labels.comingUp}</h3>
        {upcoming.length === 0 ? (
          <p className="text-sm text-muted">{labels.none}</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {upcoming.map((e) => (
              <li key={e.id} className="flex items-center gap-3">
                <span
                  className="flex w-14 shrink-0 flex-col items-center rounded-lg py-1 text-xs font-bold"
                  style={{ background: `color-mix(in oklab, ${e.colour} 22%, var(--glass))` }}
                >
                  {short.format(new Date(e.date + "T00:00:00Z"))}
                </span>
                <span className="min-w-0 text-sm leading-snug">{e.title}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
