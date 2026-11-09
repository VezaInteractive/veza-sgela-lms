import { getTranslations } from "next-intl/server";
import { cn } from "@sgela/ui";
import { JourneyScene } from "./journey-scene";
import { SignupSteps } from "./signup-steps";
import { Wordmark } from "./wordmark";

const CODES = ["AVI", "ENG", "CUL", "MED", "AGR"] as const;

async function storyProps() {
  const tw = await getTranslations("worlds");
  const ts = await getTranslations("start.story");
  return {
    names: Object.fromEntries(CODES.map((c) => [c, tw(c)])),
    captions: [ts("expo"), ts("world"), ts("score"), ts("match")] as [
      string,
      string,
      string,
      string,
    ],
    pauseLabel: ts("pause"),
    playLabel: ts("play"),
  };
}

/** Deep-space brand half of the sign-up layout with the animated journey story (D-031). */
export async function BrandPanel({ className }: { className?: string }) {
  const t = await getTranslations("app");
  const story = await storyProps();
  return (
    <aside className={cn("relative isolate overflow-hidden bg-space text-white", className)}>
      <JourneyScene {...story} />
      <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-space via-transparent via-35% to-space/15" />
      <div className="pointer-events-none absolute inset-y-0 left-0 w-2/5 bg-linear-to-r from-space/60 to-transparent" />
      <div className="pointer-events-none relative z-10 flex h-full flex-col justify-between gap-10 p-10 xl:p-14">
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
  const story = await storyProps();
  return (
    <div className={cn("relative isolate overflow-hidden bg-space text-white", className)}>
      <JourneyScene {...story} compact />
      <div className="pointer-events-none absolute inset-0 bg-linear-to-r from-space via-space/70 to-transparent" />
      <p className="pointer-events-none relative z-10 max-w-[16rem] px-4 py-7 font-heading text-lg leading-snug font-semibold">
        {t("tagline")}
      </p>
    </div>
  );
}
