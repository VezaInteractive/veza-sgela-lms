import { getTranslations } from "next-intl/server";

export const OPTIONAL_SCOPES = ["MATCHING", "PARTNER_CONTACT", "MARKETING"] as const;

/** Opt-in checkboxes (L-ON-5/6). Server component so text comes from the active locale. */
export async function ConsentChoices({
  scopes,
  platformRequired,
}: {
  scopes: readonly string[];
  platformRequired: boolean;
}) {
  const t = await getTranslations("consent");
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="sr-only">{t("title")}</legend>
      {platformRequired ? (
        <label className="flex gap-3 rounded-md border border-border bg-surface p-4">
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
        <label key={scope} className="flex gap-3 rounded-md border border-border bg-surface p-4">
          <input
            type="checkbox"
            name={scope}
            defaultChecked={scope === "MATCHING"}
            className="mt-1 size-5 shrink-0 accent-primary"
          />
          <span className="flex flex-col gap-1">
            <span className="font-semibold">{t(scope as never)}</span>
            <span className="text-sm text-muted">{t((scope + "Help") as never)}</span>
          </span>
        </label>
      ))}
    </fieldset>
  );
}
