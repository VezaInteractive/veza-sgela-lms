import { getTranslations } from "next-intl/server";
import { cn } from "@sgela/ui";
import { OrbitArt } from "./orbit-art";
import { SignupSteps } from "./signup-steps";
import { Wordmark } from "./wordmark";

/** Deep-space brand half of the sign-up layout (reference screens 1-5, Veza brand). */
export async function BrandPanel({ className }: { className?: string }) {
  const t = await getTranslations("app");
  return (
    <aside className={cn("relative isolate overflow-hidden bg-space text-white", className)}>
      <OrbitArt align="xMinYMid" className="absolute inset-0 -z-10 size-full" />
      <div className="absolute inset-0 -z-10 bg-linear-to-t from-space via-space/30 to-space/60" />
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
  return (
    <div className={cn("relative isolate overflow-hidden bg-space text-white", className)}>
      <OrbitArt className="absolute inset-0 -z-10 size-full" />
      <div className="absolute inset-0 -z-10 bg-linear-to-r from-space via-space/80 to-space/10" />
      <p className="max-w-[17rem] px-4 py-6 font-heading text-lg leading-snug font-semibold">
        {t("tagline")}
      </p>
    </div>
  );
}
