"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getDb } from "@sgela/db";
import { normaliseClaimCode, normaliseSaMobile } from "@sgela/contracts";
import { trackEvent } from "@/lib/analytics/server";
import { requestOtp, verifyOtp } from "@/lib/auth/otp";
import {
  endAllSessions,
  endCurrentSession,
  getCurrentSession,
  startSession,
} from "@/lib/auth/session";
import { CLAIM_COOKIE, claimSession } from "@/lib/claim/service";
import { recordConsents } from "@/lib/consent/service";
import { inviteGuardian } from "@/lib/guardian/service";
import { clientIpFrom } from "@/lib/http";
import { STEP_ONE_FIELDS, parseProfile } from "@/lib/onboarding/profile-schema";
import { isMinor, onboardingPath } from "@/lib/onboarding/steps";
import { LOCALE_COOKIE } from "@/i18n/config";

const OTP_PHONE_COOKIE = "sgela_otp_phone";
const TRUST_COOKIE = "sgela_trust";
const shortCookie = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 15 * 60,
  secure:
    process.env.NODE_ENV === "production" && !(process.env.APP_URL ?? "").startsWith("http://"),
};

export interface FormState {
  error?: string;
  params?: Record<string, string | number>;
  fieldErrors?: Record<string, string>;
  step?: number;
  /** Echo of submitted text so a failed submit does not wipe what the learner typed. */
  values?: Record<string, string>;
}

async function ip() {
  return clientIpFrom(await headers());
}

function otpErrorState(code: string, retryAfterSec = 0): FormState {
  switch (code) {
    case "RESEND_TOO_SOON":
      return { error: "resendTooSoon", params: { seconds: retryAfterSec } };
    case "PHONE_RATE_LIMITED":
    case "IP_RATE_LIMITED":
      return { error: "rateLimited", params: { minutes: Math.ceil(retryAfterSec / 60) } };
    default:
      return { error: "generic" };
  }
}

/** /start: send a code to the number. */
export async function requestCodeAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const raw = String(formData.get("phone") ?? "").slice(0, 25);
  const values = { phone: raw };
  const phoneE164 = normaliseSaMobile(raw);
  if (!phoneE164) return { fieldErrors: { phone: "phoneInvalid" }, values };
  const t = await getTranslations("sms");
  const result = await requestOtp({
    phoneE164,
    ip: await ip(),
    message: (code) => t("otp", { code }),
  });
  if (!result.ok) return { ...otpErrorState(result.code, result.retryAfterSec), values };
  const store = await cookies();
  store.set(OTP_PHONE_COOKIE, phoneE164, shortCookie);
  store.set(TRUST_COOKIE, formData.get("trustDevice") ? "1" : "0", shortCookie);
  await trackEvent({ name: "otp_requested", props: { channel: "sms" } });
  redirect("/start/verify");
}

/** /start/verify: resend after 30 s. */
export async function resendCodeAction(_prev: FormState): Promise<FormState> {
  const phoneE164 = (await cookies()).get(OTP_PHONE_COOKIE)?.value;
  if (!phoneE164) redirect("/start");
  const t = await getTranslations("sms");
  const result = await requestOtp({
    phoneE164,
    ip: await ip(),
    message: (code) => t("otp", { code }),
  });
  if (!result.ok) return otpErrorState(result.code, result.retryAfterSec);
  await trackEvent({ name: "otp_requested", props: { channel: "sms", resend: true } });
  return {};
}

/** Link a pending claim cookie once the learner exists, then clear it. */
async function linkPendingClaim(learnerId: string): Promise<string | null> {
  const store = await cookies();
  const pending = store.get(CLAIM_COOKIE)?.value;
  if (!pending) return null;
  store.delete(CLAIM_COOKIE);
  const result = await claimSession(pending, learnerId);
  const session = await getCurrentSession();
  await trackEvent({
    name: result.ok ? "claim_linked" : "claim_failed",
    userId: session?.user.id,
    props: result.ok ? { worlds: result.worlds.length } : { reason: result.code },
  });
  return result.ok ? "linked" : result.code;
}

/** /start/verify: check the code, start the session, route to the next step. */
export async function verifyCodeAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const store = await cookies();
  const phoneE164 = store.get(OTP_PHONE_COOKIE)?.value;
  if (!phoneE164) redirect("/start");
  const code = String(formData.get("code") ?? "").replace(/\D/g, "");
  if (code.length !== 6) return { fieldErrors: { code: "codeInvalid" } };

  const result = await verifyOtp({ phoneE164, code });
  if (!result.ok) {
    await trackEvent({ name: "otp_failed", props: { reason: result.code } });
    if (result.code === "WRONG_CODE") {
      return { fieldErrors: { code: "codeWrong" }, params: { left: result.attemptsLeft } };
    }
    const key = {
      EXPIRED: "codeExpired",
      TOO_MANY_ATTEMPTS: "codeLocked",
      NO_CHALLENGE: "codeMissing",
    }[result.code];
    return { fieldErrors: { code: key } };
  }
  await startSession(result.userId, store.get(TRUST_COOKIE)?.value !== "0");
  store.delete(OTP_PHONE_COOKIE);
  store.delete(TRUST_COOKIE);
  await trackEvent({
    name: result.isNew ? "account_created" : "otp_verified",
    userId: result.userId,
  });

  const learner = await getDb().learner.findUnique({
    where: { userId: result.userId },
    include: { guardian: true },
  });
  const next = onboardingPath(learner);
  if (next) redirect(next);
  const claim = await linkPendingClaim(learner!.id);
  redirect(claim ? "/start/done?claim=" + claim : "/home");
}

async function signedInUser() {
  const session = await getCurrentSession();
  if (!session) redirect("/start");
  return session;
}

/** /start/profile: create the learner (both screens submit together). */
export async function saveProfileAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await signedInUser();
  if (session.user.learner) redirect(onboardingPath(session.user.learner) ?? "/start/done");
  const parsed = parseProfile(formData);
  if (!parsed.ok) {
    const stepOne = STEP_ONE_FIELDS.some((f) => f in parsed.errors);
    return { fieldErrors: parsed.errors, step: stepOne ? 1 : 2 };
  }
  const p = parsed.data;
  const db = getDb();
  const school = p.schoolName
    ? await db.school.findFirst({
        where: {
          districtCode: p.districtCode,
          name: { equals: p.schoolName, mode: "insensitive" },
        },
        select: { id: true },
      })
    : null;
  const known = await db.subject.findMany({
    where: { code: { in: p.subjects } },
    select: { code: true },
  });

  await db.learner.create({
    data: {
      userId: session.user.id,
      firstName: p.firstName,
      lastName: p.lastName,
      dateOfBirth: p.dateOfBirth,
      gender: p.gender,
      provinceCode: p.provinceCode,
      districtCode: p.districtCode,
      inSchool: p.inSchool,
      schoolId: school?.id ?? null,
      schoolNameFree: school ? null : p.schoolName,
      grade: p.grade,
      highestQualification: p.highestQualification,
      language: p.language.toUpperCase() as "EN" | "ZU" | "ST",
      restricted: true,
      notifyChannels: { inApp: true, sms: true, whatsapp: false },
      quietHours: { start: "20:00", end: "07:00" },
      subjects: { create: known.map((s) => ({ subjectCode: s.code })) },
    },
  });
  (await cookies()).set(LOCALE_COOKIE, p.language, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  await trackEvent({
    name: "profile_completed",
    userId: session.user.id,
    props: { minor: isMinor(p.dateOfBirth), inSchool: p.inSchool, province: p.provinceCode },
  });
  redirect(isMinor(p.dateOfBirth) ? "/start/guardian" : "/start/consent");
}

/** /start/guardian: under-18s name a guardian; the learner continues in restricted mode. */
export async function inviteGuardianAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await signedInUser();
  const learner = session.user.learner;
  if (!learner) redirect("/start/profile");
  if (!isMinor(learner.dateOfBirth)) redirect("/start/consent");
  // Resend cooldown so the guardian cannot be spammed from the "Change or resend" link.
  if (learner.guardian && Date.now() - learner.guardian.requestedAt.getTime() < 60_000) {
    return { error: "resendTooSoon", params: { seconds: 60 } };
  }

  const name = String(formData.get("guardianName") ?? "").trim();
  const phoneE164 = normaliseSaMobile(String(formData.get("guardianPhone") ?? ""));
  const relationship = String(formData.get("relationship") ?? "").trim() || null;
  const fieldErrors: Record<string, string> = {};
  if (!name) fieldErrors.guardianName = "required";
  else if (name.length > 80) fieldErrors.guardianName = "tooLong";
  if (!phoneE164) fieldErrors.guardianPhone = "phoneInvalid";
  else if (phoneE164 === session.user.phoneE164) fieldErrors.guardianPhone = "guardianSamePhone";
  if (Object.keys(fieldErrors).length > 0) return { fieldErrors };

  await inviteGuardian({ learnerId: learner.id, name, phoneE164: phoneE164!, relationship });
  await trackEvent({ name: "guardian_invited", userId: session.user.id });
  const claim = await linkPendingClaim(learner.id);
  redirect("/start/done" + (claim ? "?claim=" + claim : ""));
}

/** /start/consent: adults give their own opt-ins (L-ON-6). Platform use is required. */
export async function saveOwnConsentAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await signedInUser();
  const learner = session.user.learner;
  if (!learner) redirect("/start/profile");
  if (isMinor(learner.dateOfBirth)) redirect("/start/guardian");
  if (!formData.get("PLATFORM")) return { fieldErrors: { PLATFORM: "required" } };

  await recordConsents({
    learnerId: learner.id,
    actor: "LEARNER",
    locale: (await cookies()).get(LOCALE_COOKIE)?.value ?? "en",
    ip: await ip(),
    choices: {
      PLATFORM: true,
      MATCHING: !!formData.get("MATCHING"),
      PARTNER_CONTACT: !!formData.get("PARTNER_CONTACT"),
      MARKETING: !!formData.get("MARKETING"),
    },
  });
  await trackEvent({ name: "consent_complete", userId: session.user.id, props: { by: "LEARNER" } });
  const claim = await linkPendingClaim(learner.id);
  redirect("/start/done" + (claim ? "?claim=" + claim : ""));
}

/** /claim/[code]: "Save my results". Remember the code, then sign up or link straight away. */
export async function startClaimAction(formData: FormData) {
  const code = normaliseClaimCode(String(formData.get("code") ?? ""));
  if (!code) redirect("/start");
  const store = await cookies();
  store.set(CLAIM_COOKIE, code, { ...shortCookie, maxAge: 60 * 60 * 24 });
  const session = await getCurrentSession();
  await trackEvent({
    name: "claim_started",
    userId: session?.user.id,
    props: { signedIn: !!session },
  });
  if (!session) redirect("/start");
  const next = onboardingPath(session.user.learner);
  if (next) redirect(next);
  const claim = await linkPendingClaim(session.user.learner!.id);
  redirect("/start/done?claim=" + (claim ?? "linked"));
}

/** Me: "Add expo results" (L-ON-8). */
export async function addExpoCodeAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const code = normaliseClaimCode(String(formData.get("code") ?? ""));
  if (!code) return { fieldErrors: { code: "codeInvalid" } };
  await trackEvent({ name: "expo_code_entered" });
  redirect("/claim/" + code);
}

export async function signOutAction() {
  const session = await getCurrentSession();
  await endCurrentSession();
  await trackEvent({ name: "signed_out", userId: session?.user.id });
  redirect("/start");
}

/** L-ON-10: log out everywhere. */
export async function signOutEverywhereAction() {
  const session = await getCurrentSession();
  if (session) {
    await endAllSessions(session.user.id);
    await trackEvent({ name: "signed_out_everywhere", userId: session.user.id });
  }
  await endCurrentSession();
  redirect("/start");
}
