import { getTranslations } from "next-intl/server";
import { Sparkles, Star } from "lucide-react";
import { cn } from "@sgela/ui";
import { CareerScene } from "./career-scene";
import { SignupSteps } from "./signup-steps";
import { Wordmark } from "./wordmark";

const CODES = ["AVI", "ENG", "CUL", "MED", "AGR"] as const;

async function worldNames() {
  const tw = await getTranslations("worlds");
  return Object.fromEntries(CODES.map((c) => [c, tw(c)]));
}

/** Floating glass card over the scene (decorative, like a VR heads-up display). */
function HoloCard({
  className,
  icon: Icon,
  colour,
  title,
  value,
}: {
  className: string;
  icon: typeof Star;
  colour: string;
  title: string;
  value: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "cs-float absolute flex items-center gap-3 rounded-2xl border border-white/15 bg-white/[0.06] px-4 py-3 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.8)]",
        className,
      )}
    >
      <span
        className="flex size-9 items-center justify-center rounded-xl"
        style={{ background: `color-mix(in oklab, ${colour} 30%, transparent)`, color: colour }}
      >
        <Icon className="size-4" />
      </span>
      <span className="flex flex-col leading-tight">
        <span className="text-xs text-white/70">{title}</span>
        <span className="font-heading text-lg font-bold">{value}</span>
      </span>
    </div>
  );
}

/** Deep-space brand half of the sign-up layout (reference screens 1-5, Veza brand, D-030). */
export async function BrandPanel({ className }: { className?: string }) {
  const t = await getTranslations("app");
  const names = await worldNames();
  return (
    <aside className={cn("relative isolate overflow-hidden bg-space text-white", className)}>
      <CareerScene names={names} className="absolute inset-0 -z-10 size-full" />
      <div className="absolute inset-0 -z-10 bg-linear-to-t from-space via-transparent to-space/40" />
      <div className="absolute inset-y-0 left-0 -z-10 w-1/2 bg-linear-to-r from-space/70 to-transparent" />
      <HoloCard
        className="top-[13%] right-[6%]"
        icon={Star}
        colour="#4FA3FF"
        title={names.AVI!}
        value="78"
      />
      <HoloCard
        className="top-[62%] right-[10%] [animation-delay:-3s]"
        icon={Sparkles}
        colour="#ABCF37"
        title={names.AGR!}
        value="+40 XP"
      />
      <div className="flex h-full flex-col justify-between gap-10 p-10 xl:p-14">
        <Wordmark tone="onDark" />
        <SignupSteps />
        <p className="max-w-md font-heading text-3xl leading-tight font-semibold xl:text-4xl">
          {t("tagline")}
        </p>
      </div>
    </aside>
  );
}

/** Slim version above the form on phones and tablets. */
export async function BrandBanner({ className }: { className?: string }) {
  const t = await getTranslations("app");
  const names = await worldNames();
  return (
    <div className={cn("relative isolate overflow-hidden bg-space text-white", className)}>
      <CareerScene names={names} className="absolute inset-0 -z-10 size-full" align="xMidYMid" />
      <div className="absolute inset-0 -z-10 bg-linear-to-r from-space via-space/75 to-transparent" />
      <p className="max-w-[17rem] px-4 py-6 font-heading text-lg leading-snug font-semibold">
        {t("tagline")}
      </p>
    </div>
  );
}
