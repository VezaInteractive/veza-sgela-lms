import Image from "next/image";
import Link from "next/link";
import { GraduationCap, MapPin, Pencil, School } from "lucide-react";
import { ColourBar } from "./parts";

export interface ProfileCardProps {
  name: string;
  /** Photo URL when the learner has one; otherwise initials are shown. */
  photoUrl?: string;
  school?: string;
  grade?: string;
  place?: string;
  level: string;
  xpLabel: string;
  xpPct: number;
  editLabel: string;
  editHref: string;
}

function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]!.toUpperCase())
      .join("") || "?"
  );
}

/** Learner profile panel for the Home rail: photo, name, school facts and level progress. */
export function ProfileCard(p: ProfileCardProps) {
  return (
    <section
      aria-label={p.name}
      className="glass relative flex min-w-0 flex-col overflow-hidden rounded-2xl"
    >
      <div aria-hidden="true" className="brand-pattern h-20 shrink-0" />
      <div className="flex flex-col gap-4 px-5 pb-5">
        <div className="-mt-10 flex items-end justify-between gap-3">
          <span className="relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-ink font-heading text-2xl font-bold text-lime-500 ring-4 ring-(--glass)">
            {p.photoUrl ? (
              <Image src={p.photoUrl} alt="" fill sizes="80px" className="object-cover" />
            ) : (
              <span aria-hidden="true">{initials(p.name)}</span>
            )}
          </span>
          <Link
            href={p.editHref}
            className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold hover:border-primary"
          >
            <Pencil aria-hidden="true" className="size-3.5" />
            {p.editLabel}
          </Link>
        </div>
        <div className="flex flex-col gap-0.5">
          <h2 className="truncate font-heading text-xl font-semibold">{p.name}</h2>
          <span className="text-sm font-semibold text-link">{p.level}</span>
        </div>
        <ul className="flex flex-col gap-2 text-sm text-muted">
          {p.school ? (
            <li className="flex items-center gap-2">
              <School aria-hidden="true" className="size-4 shrink-0" />
              <span className="truncate">{p.school}</span>
            </li>
          ) : null}
          {p.grade ? (
            <li className="flex items-center gap-2">
              <GraduationCap aria-hidden="true" className="size-4 shrink-0" />
              {p.grade}
            </li>
          ) : null}
          {p.place ? (
            <li className="flex items-center gap-2">
              <MapPin aria-hidden="true" className="size-4 shrink-0" />
              <span className="truncate">{p.place}</span>
            </li>
          ) : null}
        </ul>
        <div className="flex flex-col gap-1.5">
          <ColourBar value={p.xpPct} colour="#ABCF37" label={p.xpLabel} />
          <span className="text-xs font-medium text-muted">{p.xpLabel}</span>
        </div>
      </div>
    </section>
  );
}
