import { getTranslations } from "next-intl/server";
import { saveCareerAction, saveIndustryAction } from "@/app/admin/careers/actions";

const inputClass =
  "w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm focus:border-primary focus:outline-none";
const labelClass = "flex flex-col gap-1.5 text-sm font-semibold";

function Field({
  name,
  label,
  defaultValue,
  textarea,
  type = "text",
  required,
  hint,
}: {
  name: string;
  label: string;
  defaultValue?: string | number;
  textarea?: boolean;
  type?: string;
  required?: boolean;
  hint?: string;
}) {
  return (
    <label className={labelClass}>
      <span>{label}</span>
      {textarea ? (
        <textarea name={name} defaultValue={defaultValue} rows={4} className={inputClass} />
      ) : (
        <input
          name={name}
          type={type}
          defaultValue={defaultValue}
          required={required}
          className={inputClass}
        />
      )}
      {hint ? <span className="text-xs font-normal text-muted">{hint}</span> : null}
    </label>
  );
}

export interface IndustryDefaults {
  code: string;
  name: string;
  tagline: string;
  color: string;
  sortOrder: number;
  vrSummary: string;
  whyItMatters: string[];
  sponsorOrgId: string | null;
  heroAssetId: string | null;
}

export async function IndustryForm({
  industry,
  sponsors,
  assets,
  error,
}: {
  industry: IndustryDefaults;
  sponsors: { id: string; name: string }[];
  assets: { id: string; name: string }[];
  error?: string;
}) {
  const t = await getTranslations("admin.careers");
  const f = t.raw("fields") as Record<string, string>;
  return (
    <form action={saveIndustryAction} className="flex flex-col gap-4">
      <input type="hidden" name="code" value={industry.code} />
      {error ? (
        <p className="rounded-xl border border-danger/40 bg-danger/10 p-3 text-sm">
          {t("errors." + error)}
        </p>
      ) : null}
      <Field name="name" label={f.name!} defaultValue={industry.name} required />
      <Field name="tagline" label={f.tagline!} defaultValue={industry.tagline} required />
      <Field
        name="whyItMatters"
        label={f.why!}
        defaultValue={industry.whyItMatters.join("\n")}
        textarea
      />
      <Field name="vrSummary" label={f.vrSummary!} defaultValue={industry.vrSummary} textarea />
      <div className="grid grid-cols-2 gap-4">
        <Field name="color" label={f.color!} defaultValue={industry.color} />
        <Field
          name="sortOrder"
          label={f.sortOrder!}
          type="number"
          defaultValue={industry.sortOrder}
        />
      </div>
      <label className={labelClass}>
        <span>{f.sponsor}</span>
        <select
          name="sponsorOrgId"
          defaultValue={industry.sponsorOrgId ?? ""}
          className={inputClass}
        >
          <option value="">{f.noSponsor}</option>
          {sponsors.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        </select>
      </label>
      <label className={labelClass}>
        <span>{f.heroAsset}</span>
        <select name="heroAssetId" defaultValue={industry.heroAssetId ?? ""} className={inputClass}>
          <option value="">{f.noAsset}</option>
          {assets.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </label>
      <button
        type="submit"
        className="inline-flex min-h-11 items-center justify-center self-start rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground"
      >
        {t("save")}
      </button>
    </form>
  );
}

export interface CareerDefaults {
  id: string | null;
  slug: string;
  industryCode: string;
  title: string;
  summary: string;
  salaryBandNote: string;
  dayInLife: string[];
  studyRoutes: { type: string; label: string }[];
  subjectsRequired: string[];
  subjectsRecommended: string[];
  sortOrder: number;
  roleModel: { name: string; place: string; story: string } | null;
}

export async function CareerForm({
  career,
  worlds,
  error,
}: {
  career: CareerDefaults;
  worlds: { code: string; name: string }[];
  error?: string;
}) {
  const t = await getTranslations("admin.careers");
  const f = t.raw("fields") as Record<string, string>;
  return (
    <form action={saveCareerAction} className="flex flex-col gap-4">
      {career.id ? <input type="hidden" name="id" value={career.id} /> : null}
      {error ? (
        <p className="rounded-xl border border-danger/40 bg-danger/10 p-3 text-sm">
          {t("errors." + error)}
        </p>
      ) : null}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field name="title" label={f.title!} defaultValue={career.title} required />
        <Field name="slug" label={f.slug!} defaultValue={career.slug} required />
      </div>
      <label className={labelClass}>
        <span>{f.industry}</span>
        <select name="industryCode" defaultValue={career.industryCode} className={inputClass}>
          {worlds.map((w) => (
            <option key={w.code} value={w.code}>
              {w.name}
            </option>
          ))}
        </select>
      </label>
      <Field name="summary" label={f.summary!} defaultValue={career.summary} textarea />
      <Field
        name="dayInLife"
        label={f.dayInLife!}
        defaultValue={career.dayInLife.join("\n")}
        textarea
      />
      <Field
        name="studyRoutes"
        label={f.studyRoutes!}
        defaultValue={career.studyRoutes.map((r) => `${r.type} | ${r.label}`).join("\n")}
        textarea
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field
          name="subjectsRequired"
          label={f.subjectsRequired!}
          defaultValue={career.subjectsRequired.join(", ")}
        />
        <Field
          name="subjectsRecommended"
          label={f.subjectsRecommended!}
          defaultValue={career.subjectsRecommended.join(", ")}
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_8rem]">
        <Field name="salaryBandNote" label={f.salary!} defaultValue={career.salaryBandNote} />
        <Field
          name="sortOrder"
          label={f.sortOrder!}
          type="number"
          defaultValue={career.sortOrder}
        />
      </div>
      <fieldset className="grid grid-cols-1 gap-4 rounded-2xl border border-border p-4 sm:grid-cols-2">
        <Field name="roleName" label={f.roleName!} defaultValue={career.roleModel?.name ?? ""} />
        <Field name="rolePlace" label={f.rolePlace!} defaultValue={career.roleModel?.place ?? ""} />
        <div className="sm:col-span-2">
          <Field
            name="roleStory"
            label={f.roleStory!}
            defaultValue={career.roleModel?.story ?? ""}
            textarea
          />
        </div>
      </fieldset>
      <button
        type="submit"
        className="inline-flex min-h-11 items-center justify-center self-start rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground"
      >
        {t("save")}
      </button>
    </form>
  );
}
