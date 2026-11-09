"use server";

import { cookies, headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { CONSENT_SCOPES, type ConsentScope } from "@sgela/matching";
import { trackEvent } from "@/lib/analytics/server";
import { requireSession } from "@/lib/auth/rbac";
import { ConsentError, recordConsents } from "@/lib/consent/service";
import { clientIpFrom } from "@/lib/http";
import { LOCALE_COOKIE } from "@/i18n/config";
import {
  AVATAR_MAX_BYTES,
  AvatarRejected,
  removeAvatar,
  setAvatar,
  type AvatarError,
} from "@/lib/profile/avatar";

const CHANGEABLE: ConsentScope[] = ["MATCHING", "PARTNER_CONTACT", "MARKETING"];

/** Privacy centre toggle (L-PF-2). Appends a consent row; never edits history. */
export async function setConsentAction(formData: FormData) {
  const session = await requireSession();
  const learner = session.user.learner;
  if (!learner) return;
  const scope = String(formData.get("scope")) as ConsentScope;
  if (!CONSENT_SCOPES.includes(scope) || !CHANGEABLE.includes(scope)) return;
  const granted = formData.get("granted") === "true";
  try {
    await recordConsents({
      learnerId: learner.id,
      choices: { [scope]: granted },
      actor: "LEARNER",
      locale: (await cookies()).get(LOCALE_COOKIE)?.value ?? "en",
      ip: clientIpFrom(await headers()),
    });
  } catch (err) {
    if (err instanceof ConsentError) return;
    throw err;
  }
  await trackEvent({ name: "consent_updated", userId: session.user.id, props: { scope, granted } });
  revalidatePath("/me/privacy");
}

export interface PhotoState {
  ok?: "saved" | "removed";
  error?: AvatarError | "NO_FILE";
}

/** Upload or replace the learner's own profile photo (D-025). */
export async function uploadPhotoAction(
  _prev: PhotoState,
  formData: FormData,
): Promise<PhotoState> {
  const session = await requireSession();
  const learner = session.user.learner;
  if (!learner) return { error: "NO_FILE" };
  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) return { error: "NO_FILE" };
  if (file.size > AVATAR_MAX_BYTES) {
    await trackEvent({
      name: "profile_photo_rejected",
      userId: session.user.id,
      props: { code: "TOO_BIG" },
    });
    return { error: "TOO_BIG" };
  }
  try {
    await setAvatar(learner.id, Buffer.from(await file.arrayBuffer()));
  } catch (err) {
    if (err instanceof AvatarRejected) {
      await trackEvent({
        name: "profile_photo_rejected",
        userId: session.user.id,
        props: { code: err.code },
      });
      return { error: err.code };
    }
    throw err;
  }
  await trackEvent({ name: "profile_photo_updated", userId: session.user.id });
  revalidatePath("/me");
  revalidatePath("/home");
  return { ok: "saved" };
}

export async function removePhotoAction(): Promise<PhotoState> {
  const session = await requireSession();
  const learner = session.user.learner;
  if (!learner) return {};
  await removeAvatar(learner.id);
  await trackEvent({ name: "profile_photo_removed", userId: session.user.id });
  revalidatePath("/me");
  revalidatePath("/home");
  return { ok: "removed" };
}

/** One entry point for the photo form, so its status always reflects the last action. */
export async function photoAction(prev: PhotoState, formData: FormData): Promise<PhotoState> {
  return formData.get("intent") === "remove"
    ? removePhotoAction()
    : uploadPhotoAction(prev, formData);
}
