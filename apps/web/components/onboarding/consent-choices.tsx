import { getTranslations } from "next-intl/server";

export const OPTIONAL_SCOPES = ["MATCHING", "PARTNER_CONTACT", "MARKETING"] as const;

/** Opt-in checkboxes (L-ON-5/6). Server component so text comes from the active locale. */
export async function ConsentChoices({
  scopes,
  platformRequired,
  forLearner,
}: {
  scopes: readonly string[];
  platformRequired: boolean;
  /** Guardian view: wording names the learner ("Match Thandeka with...") instead of "me". */
  forLearner?: string;
}) {
  const tc = await getTranslations("consent");
  const t = (key: string) =>
    forLearner ? tc(("guardian" + key) as never, { name: forLearner } as never) : tc(key as never);
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="sr-only">{tc("title")}</legend>
      {platformRequired ? (
        <label className="flex cursor-pointer gap-3 rounded-2xl border border-border bg-surface p-4 transition-colors hover:border-primary has-checked:border-primary">
          <input
            type="checkbox"
            name="PLATFORM"
            defaultChecked
            required
            className="mt-1 size-5 shrink-0 accent-primary"
          />
          <span className="flex flex-col gap-1">
            <span className="font-semibold">{t("PLATFORM")}</span>
            <span className="text-sm text-muted">{t("PLATFORMHelp")}</span>
          </span>
        </label>
      ) : null}
      {scopes.map((scope) => (
        <label
          key={scope}
          className="flex cursor-pointer gap-3 rounded-2xl border border-border bg-surface p-4 transition-colors hover:border-primary has-checked:border-primary"
        >
          <input
            type="checkbox"
            name={scope}
            defaultChecked={scope === "MATCHING"}
            className="mt-1 size-5 shrink-0 accent-primary"
          />
          <span className="flex flex-col gap-1">
            <span className="font-semibold">{t(scope)}</span>
            <span className="text-sm text-muted">{t(scope + "Help")}</span>
          </span>
        </label>
      ))}
    </fieldset>
  );
}
