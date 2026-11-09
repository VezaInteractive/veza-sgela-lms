import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, ChevronRight, Clock, Layers, type LucideIcon } from "lucide-react";
import { cn } from "@sgela/ui";
import { WorldIcon, worldStyle } from "@/components/demo/world-visuals";

/**
 * Dashboard building blocks (D-021), modelled on the reference screens' structure:
 * a plain section heading, pastel stat tiles, white panels and saturated pastel course cards.
 * Colour is decorative throughout; every value also has a text label.
 */

export function PageIntro({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
      <div className="flex flex-col gap-1.5">
        <h1 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">{title}</h1>
        {intro ? <p className="max-w-2xl text-muted">{intro}</p> : null}
      </div>
      {children}
    </div>
  );
}

export interface Stat {
  label: string;
  value: string;
  icon: LucideIcon;
  /** Hex colour for the pastel fill and icon. */
  accent: string;
}

export function StatStrip({ stats }: { stats: Stat[] }) {
  return (
    <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {stats.map(({ label, value, icon: Icon, accent }) => (
        <li
          key={label}
          style={{ ["--w" as string]: accent }}
          className="stat-tile flex items-center gap-3 rounded-2xl p-3.5 md:gap-4 md:p-4"
        >
          <span
            aria-hidden="true"
            className="stat-chip flex size-11 shrink-0 items-center justify-center rounded-xl md:size-12"
          >
            <Icon className="size-5 md:size-6" />
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="font-heading text-xl font-bold tabular-nums md:text-2xl">{value}</span>
            <span className="text-xs leading-tight text-muted md:text-sm">{label}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

export function Panel({
  title,
  action,
  children,
  className,
}: {
  title: string;
  action?: { href: string; label: string };
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("glass flex min-w-0 flex-col gap-4 rounded-2xl p-5 md:p-6", className)}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-heading text-lg font-semibold">{title}</h2>
        {action ? (
          <Link
            href={action.href}
            className="flex items-center gap-0.5 text-sm font-semibold text-link hover:underline"
          >
            {action.label}
            <ChevronRight aria-hidden="true" className="size-4" />
          </Link>
        ) : null}
      </div>
      {children}
    </section>
  );
}

/** Thin progress bar in any colour; the track is a pale tint of the same colour. */
export function ColourBar({
  value,
  colour,
  label,
  className,
}: {
  value: number;
  colour: string;
  label: string;
  className?: string;
}) {
  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      style={{ ["--bar" as string]: colour }}
      className={cn("colour-bar h-2 w-full overflow-hidden rounded-full", className)}
    >
      <div className="h-full rounded-full bg-(--bar)" style={{ width: `${value}%` }} />
    </div>
  );
}

/** Large progress ring with a caption and the percentage in the middle. */
export function ProgressRing({
  value,
  caption,
  label,
  colour = "#4FA3FF",
  size = 148,
}: {
  value: number;
  caption: string;
  label: string;
  colour?: string;
  size?: number;
}) {
  const stroke = 14;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(100, value));
  return (
    <div
      role="img"
      aria-label={label}
      className="relative shrink-0"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`color-mix(in oklab, ${colour} 16%, var(--glass))`}
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={colour}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${(v / 100) * c} ${c}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <span
        aria-hidden="true"
        className="absolute inset-0 flex flex-col items-center justify-center"
      >
        <span className="text-xs text-muted">{caption}</span>
        <span className="font-heading text-3xl font-bold tabular-nums">{v}%</span>
      </span>
    </div>
  );
}

export interface CourseCardData {
  slug: string;
  code: string;
  world: string | null;
  title: string;
  progress: number;
  accredited: boolean;
}

/** Saturated pastel course card (reference "MyCourses" cards), tinted by career world. */
export function CourseCard({
  course,
  labels,
  photo,
}: {
  course: CourseCardData;
  /** Optional header photo; omit under data saver. */
  photo?: string;
  labels: {
    minutes: string;
    topics: string;
    complete: string;
    accredited: string;
    progressLabel: string;
  };
}) {
  const world = course.world ?? "AGR";
  return (
    <Link
      href={"/learn/" + course.slug}
      style={worldStyle(world)}
      className="course-card lift flex h-full flex-col overflow-hidden rounded-3xl"
    >
      {photo ? <CardPhoto src={photo} /> : null}
      <span className="flex flex-1 flex-col p-6 md:p-7">
        <span className="flex items-start justify-between gap-3">
          <WorldIcon
            code={world}
            size="lg"
            className={cn(
              "course-card-icon",
              photo && "relative z-10 -mt-14 ring-4 ring-(--card-ring)",
            )}
          />
          <span className="pt-1 text-xs font-semibold tracking-wide text-muted">{course.code}</span>
        </span>
        <span className="mt-5 font-heading text-2xl leading-tight font-semibold">
          {course.title}
        </span>
        <span className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm font-medium text-muted">
          <span className="flex items-center gap-1.5">
            <Clock aria-hidden="true" className="size-4" />
            {labels.minutes}
          </span>
          <span className="flex items-center gap-1.5">
            <Layers aria-hidden="true" className="size-4" />
            {labels.topics}
          </span>
          {course.accredited ? (
            <span className="flex items-center gap-1.5">
              <BadgeCheck aria-hidden="true" className="size-4" />
              {labels.accredited}
            </span>
          ) : null}
        </span>
        <span className="mt-auto flex flex-col gap-2 pt-8">
          <ColourBar
            value={course.progress}
            colour="var(--w-strong)"
            label={labels.progressLabel}
            className="course-card-track h-2.5"
          />
          <span className="text-sm font-medium text-muted">{labels.complete}</span>
        </span>
      </span>
    </Link>
  );
}

/** Full-bleed photo header for cards. Decorative (the card has its own title); lazy-loaded. */
export function CardPhoto({ src }: { src: string }) {
  return (
    <span className="relative block h-40 w-full shrink-0 md:h-44">
      <Image
        src={src}
        alt=""
        fill
        sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
        className="object-cover"
      />
      <span
        aria-hidden="true"
        className="absolute inset-0 bg-linear-to-t from-black/25 to-transparent"
      />
    </span>
  );
}
