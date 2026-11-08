import { isDistrictInProvince, isProvinceCode } from "@sgela/geo";
import { ageOn } from "./steps";

/** Profile fields (L-ON-3). Errors are i18n keys under `errors.*`, never English text. */
export const GENDERS = ["FEMALE", "MALE", "NON_BINARY", "PREFER_NOT_TO_SAY"] as const;
export const PROFILE_LANGUAGES = ["en", "zu", "st"] as const;
export const QUALIFICATIONS = ["NONE", "MATRIC", "TVET", "DIPLOMA", "DEGREE", "OTHER"] as const;
export const GRADES = [8, 9, 10, 11, 12] as const;
export const MIN_AGE = 10;

export type ErrorKey =
  "required" | "dobInvalid" | "tooYoung" | "districtInvalid" | "gradeInvalid" | "tooLong";

export interface ProfileInput {
  firstName: string;
  lastName: string | null;
  dateOfBirth: Date;
  gender: (typeof GENDERS)[number] | null;
  language: (typeof PROFILE_LANGUAGES)[number];
  provinceCode: string;
  districtCode: string;
  inSchool: boolean;
  schoolName: string | null;
  grade: number | null;
  highestQualification: string | null;
  subjects: string[];
}

export type ProfileParse =
  | { ok: true; data: ProfileInput }
  | { ok: false; errors: Partial<Record<keyof ProfileInput, ErrorKey>> };

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();

/** Step-1 fields; used to send the learner back to screen 1 when one fails. */
export const STEP_ONE_FIELDS = [
  "firstName",
  "lastName",
  "dateOfBirth",
  "gender",
  "language",
] as const;

export function parseProfile(fd: FormData, now: Date = new Date()): ProfileParse {
  const errors: Partial<Record<keyof ProfileInput, ErrorKey>> = {};

  const firstName = str(fd, "firstName");
  if (!firstName) errors.firstName = "required";
  else if (firstName.length > 60) errors.firstName = "tooLong";
  const lastName = str(fd, "lastName") || null;
  if (lastName && lastName.length > 60) errors.lastName = "tooLong";

  const dobRaw = str(fd, "dateOfBirth");
  const dateOfBirth = new Date(dobRaw + "T00:00:00Z");
  if (!dobRaw) errors.dateOfBirth = "required";
  else if (!/^\d{4}-\d{2}-\d{2}$/.test(dobRaw) || Number.isNaN(dateOfBirth.getTime())) {
    errors.dateOfBirth = "dobInvalid";
  } else {
    const age = ageOn(dateOfBirth, now);
    if (age < 0 || age > 100) errors.dateOfBirth = "dobInvalid";
    else if (age < MIN_AGE) errors.dateOfBirth = "tooYoung";
  }

  const genderRaw = str(fd, "gender");
  const gender = (GENDERS as readonly string[]).includes(genderRaw)
    ? (genderRaw as ProfileInput["gender"])
    : null;
  const langRaw = str(fd, "language");
  const language = (PROFILE_LANGUAGES as readonly string[]).includes(langRaw)
    ? (langRaw as ProfileInput["language"])
    : "en";

  const provinceCode = str(fd, "provinceCode");
  if (!provinceCode || !isProvinceCode(provinceCode)) errors.provinceCode = "required";
  const districtCode = str(fd, "districtCode");
  if (!districtCode) errors.districtCode = "required";
  else if (!isDistrictInProvince(districtCode, provinceCode))
    errors.districtCode = "districtInvalid";

  const inSchool = str(fd, "inSchool") !== "no";
  const schoolName = str(fd, "schoolName") || null;
  if (schoolName && schoolName.length > 120) errors.schoolName = "tooLong";

  let grade: number | null = null;
  let highestQualification: string | null = null;
  if (inSchool) {
    const g = Number(str(fd, "grade"));
    if (!str(fd, "grade")) errors.grade = "required";
    else if (!(GRADES as readonly number[]).includes(g)) errors.grade = "gradeInvalid";
    else grade = g;
  } else {
    const q = str(fd, "highestQualification");
    if (!(QUALIFICATIONS as readonly string[]).includes(q))
      errors.highestQualification = "required";
    else highestQualification = q;
  }

  const showSubjects = !inSchool || (grade ?? 0) >= 10;
  const subjects = showSubjects
    ? [...new Set(fd.getAll("subjects").map(String))].filter((s) => /^[A-Z_]{2,40}$/.test(s))
    : [];

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return {
    ok: true,
    data: {
      firstName,
      lastName,
      dateOfBirth,
      gender,
      language,
      provinceCode,
      districtCode,
      inSchool,
      schoolName: inSchool ? schoolName : null,
      grade,
      highestQualification,
      subjects,
    },
  };
}
