import Image from "next/image";
import Link from "next/link";
import { Pencil } from "lucide-react";
import { OrbitArt } from "@/components/brand/orbit-art";

export interface ProfileCardProps {
  name: string;
  /** Photo URL when the learner has one; otherwise a branded backdrop with initials. */
  photoUrl?: string;
  /** e.g. "Grade 10 · Vhembe Secondary School". */
  subtitle?: string;
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

/**
 * Portrait profile card (D-025): the photo fills the card and the learner's details sit on a
 * dark gradient at the bottom, so text stays readable on any photo. No photo: deep-space brand
 * art with large initials.
 */
export function ProfileCard(p: ProfileCardProps) {
  return (
    <section
      aria-label={p.name}
      className="relative isolate flex aspect-4/5 max-h-[30rem] w-full flex-col justify-end overflow-hidden rounded-3xl bg-space text-white shadow-(--card-shadow)"
    >
      {p.photoUrl ? (
        <Image
          src={p.photoUrl}
          alt=""
          fill
          sizes="(min-width: 1280px) 18rem, (min-width: 768px) 50vw, 100vw"
          className="-z-20 object-cover object-top"
          priority
          // Private, cookie-protected URL: the image optimiser cannot fetch it. Already 512 px WebP.
          unoptimized
        />
      ) : (
        <>
          <OrbitArt className="absolute inset-0 -z-20 size-full opacity-80" />
          <span
            aria-hidden="true"
            className="absolute inset-x-0 top-[22%] -z-10 mx-auto flex size-28 items-center justify-center rounded-full bg-lime-500 font-heading text-4xl font-bold text-ink shadow-[0_0_48px_-8px_var(--color-lime-500)]"
          >
            {initials(p.name)}
          </span>
        </>
      )}
      <span
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-linear-to-t from-black/85 via-black/25 to-transparent"
      />

      <Link
        href={p.editHref}
        aria-label={p.editLabel}
        className="absolute top-3 right-3 flex size-10 items-center justify-center rounded-full border border-white/40 bg-black/35 text-white hover:bg-black/55"
      >
        <Pencil aria-hidden="true" className="size-4" />
      </Link>

      <div className="flex flex-col gap-3 p-5">
        <div className="flex items-end justify-between gap-3">
          <div className="flex min-w-0 flex-col">
            <h2 className="truncate font-heading text-2xl font-semibold">{p.name}</h2>
            {p.subtitle ? <p className="truncate text-sm text-white/85">{p.subtitle}</p> : null}
            {p.place ? <p className="truncate text-sm text-white/85">{p.place}</p> : null}
          </div>
          <span className="shrink-0 rounded-full border border-white/40 bg-black/35 px-3 py-1.5 text-sm font-semibold">
            {p.level}
          </span>
        </div>
        <div className="flex flex-col gap-1.5">
          <div
            role="progressbar"
            aria-valuenow={p.xpPct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={p.xpLabel}
            className="xp-shine h-1.5 w-full overflow-hidden rounded-full bg-white/25"
          >
            <div className="h-full rounded-full bg-lime-500" style={{ width: `${p.xpPct}%` }} />
          </div>
          <span className="text-xs text-white/85">{p.xpLabel}</span>
        </div>
      </div>
    </section>
  );
}
