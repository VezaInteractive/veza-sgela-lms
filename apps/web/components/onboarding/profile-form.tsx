"use client";

import { useActionState, useEffect, useId, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Button, Input } from "@sgela/ui";
import { PROVINCES, districtsForProvince } from "@sgela/geo";
import { saveProfileAction, type FormState } from "@/app/(auth)/start/actions";
import { schoolsForDistrict } from "@/app/(auth)/start/school-actions";
import {
  GENDERS,
  GRADES,
  PROFILE_LANGUAGES,
  QUALIFICATIONS,
} from "@/lib/onboarding/profile-schema";
import { useErrorText } from "./field-error";

const GENDER_KEYS = {
  FEMALE: "genderFemale",
  MALE: "genderMale",
  NON_BINARY: "genderNonBinary",
  PREFER_NOT_TO_SAY: "genderPreferNot",
} as const;
const QUAL_KEYS = {
  NONE: "qualNone",
  MATRIC: "qualMatric",
  TVET: "qualTvet",
  DIPLOMA: "qualDiploma",
  DEGREE: "qualDegree",
  OTHER: "qualOther",
} as const;

function Select(props: {
  name: string;
  label: string;
  error?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (v: string) => void;
  children: React.ReactNode;
}) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {props.label}
      </label>
      <select
        id={id}
        name={props.name}
        value={props.value}
        defaultValue={props.defaultValue}
        onChange={(e) => props.onChange?.(e.target.value)}
        aria-invalid={props.error ? true : undefined}
        aria-describedby={props.error ? id + "-err" : undefined}
        className="h-11 rounded-md border border-border bg-surface px-3 text-base text-foreground"
      >
        {props.children}
      </select>
      {props.error ? (
        <p id={id + "-err"} className="text-sm text-danger">
          {props.error}
        </p>
      ) : null}
    </div>
  );
}

/** L-ON-3 in two screens. Both screens live in one form so a single submit saves everything. */
export function ProfileForm({ subjects }: { subjects: string[] }) {
  const t = useTranslations("profile");
  const tc = useTranslations("common");
  const tl = useTranslations("languages");
  const ts = useTranslations("subjects");
  const tStart = useTranslations("start");
  const err = useErrorText();
  const locale = useLocale();
  const [state, action, pending] = useActionState<FormState, FormData>(saveProfileAction, {});
  const [step, setStep] = useState(1);
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [inSchool, setInSchool] = useState(true);
  const [grade, setGrade] = useState("");
  const [schools, setSchools] = useState<string[]>([]);
  const listId = useId();

  // Jump to the screen holding the first server-side error (derived from the action result).
  const [seenState, setSeenState] = useState(state);
  if (state !== seenState) {
    setSeenState(state);
    if (state.step) setStep(state.step);
  }

  useEffect(() => {
    let live = true;
    if (district) void schoolsForDistrict(district).then((s) => live && setSchools(s));
    return () => {
      live = false;
    };
  }, [district]);

  const errors = { ...(state.fieldErrors ?? {}), ...localErrors };
  const e = (k: string) => err(errors[k]);
  const showSubjects = !inSchool || Number(grade) >= 10;

  function next(ev: React.MouseEvent<HTMLButtonElement>) {
    const fd = new FormData(ev.currentTarget.form!);
    const missing: Record<string, string> = {};
    if (!String(fd.get("firstName") ?? "").trim()) missing.firstName = "required";
    if (!String(fd.get("dateOfBirth") ?? "")) missing.dateOfBirth = "required";
    setLocalErrors(missing);
    if (Object.keys(missing).length === 0) {
      setStep(2);
      requestAnimationFrame(() => document.getElementById("profile-step-2")?.focus());
    }
  }

  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      <p className="text-sm font-semibold text-muted">{tStart("stepOf", { step: 3, total: 4 })}</p>
      <fieldset hidden={step !== 1} className="flex flex-col gap-5">
        <legend className="mb-4 font-heading text-2xl font-bold">{t("title")}</legend>
        <Input
          name="firstName"
          label={t("firstName")}
          autoComplete="given-name"
          error={e("firstName")}
          required
        />
        <Input
          name="lastName"
          label={t("lastName")}
          autoComplete="family-name"
          error={e("lastName")}
        />
        <Input
          name="dateOfBirth"
          type="date"
          label={t("dateOfBirth")}
          autoComplete="bday"
          error={e("dateOfBirth")}
          required
        />
        <Select name="gender" label={t("gender")} defaultValue="">
          <option value="">{t("genderNone")}</option>
          {GENDERS.map((g) => (
            <option key={g} value={g}>
              {t(GENDER_KEYS[g])}
            </option>
          ))}
        </Select>
        <Select name="language" label={t("language")} defaultValue={locale}>
          {PROFILE_LANGUAGES.map((l) => (
            <option key={l} value={l}>
              {tl(l)}
            </option>
          ))}
        </Select>
        <Button type="button" size="lg" onClick={next}>
          {tc("continue")}
        </Button>
      </fieldset>

      <fieldset hidden={step !== 2} className="flex flex-col gap-5">
        <legend id="profile-step-2" tabIndex={-1} className="mb-4 font-heading text-2xl font-bold">
          {t("titleSchool")}
        </legend>
        <Select
          name="provinceCode"
          label={t("province")}
          value={province}
          onChange={(v) => {
            setProvince(v);
            setDistrict("");
          }}
          error={e("provinceCode")}
        >
          <option value="">{t("provinceChoose")}</option>
          {PROVINCES.map((p) => (
            <option key={p.code} value={p.code}>
              {p.name}
            </option>
          ))}
        </Select>
        <Select
          name="districtCode"
          label={t("district")}
          value={district}
          onChange={setDistrict}
          error={e("districtCode")}
        >
          <option value="">{t("districtChoose")}</option>
          {districtsForProvince(province).map((d) => (
            <option key={d.code} value={d.code}>
              {d.name}
            </option>
          ))}
        </Select>

        <fieldset className="flex flex-col gap-2">
          <legend className="sr-only">{t("school")}</legend>
          {(
            [
              ["yes", t("inSchool")],
              ["no", t("notInSchool")],
            ] as const
          ).map(([value, label]) => (
            <label key={value} className="flex min-h-11 items-center gap-3">
              <input
                type="radio"
                name="inSchool"
                value={value}
                checked={inSchool === (value === "yes")}
                onChange={() => setInSchool(value === "yes")}
                className="size-5 accent-primary"
              />
              {label}
            </label>
          ))}
        </fieldset>

        {inSchool ? (
          <>
            <Input
              name="schoolName"
              label={t("school")}
              hint={t("schoolHint")}
              list={listId}
              autoComplete="off"
              error={e("schoolName")}
            />
            <datalist id={listId}>
              {schools.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
            <Select
              name="grade"
              label={t("grade")}
              value={grade}
              onChange={setGrade}
              error={e("grade")}
            >
              <option value="">{t("gradeChoose")}</option>
              {GRADES.map((g) => (
                <option key={g} value={g}>
                  {t("gradeN", { n: g })}
                </option>
              ))}
            </Select>
          </>
        ) : (
          <Select
            name="highestQualification"
            label={t("qualification")}
            defaultValue=""
            error={e("highestQualification")}
          >
            <option value="">{t("qualificationChoose")}</option>
            {QUALIFICATIONS.map((q) => (
              <option key={q} value={q}>
                {t(QUAL_KEYS[q])}
              </option>
            ))}
          </Select>
        )}

        {showSubjects ? (
          <fieldset className="flex flex-col gap-2">
            <legend className="text-sm font-medium">{t("subjects")}</legend>
            <p className="text-sm text-muted">{t("subjectsHint")}</p>
            <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
              {subjects.map((code) => (
                <label key={code} className="flex min-h-11 items-center gap-3 text-sm">
                  <input
                    type="checkbox"
                    name="subjects"
                    value={code}
                    className="size-5 accent-primary"
                  />
                  {ts(code as never)}
                </label>
              ))}
            </div>
          </fieldset>
        ) : null}

        <div className="flex gap-3">
          <Button type="button" variant="secondary" size="lg" onClick={() => setStep(1)}>
            {tc("back")}
          </Button>
          <Button type="submit" size="lg" className="flex-1" disabled={pending}>
            {pending ? tc("saving") : tc("continue")}
          </Button>
        </div>
      </fieldset>
    </form>
  );
}
