import { randomBytes } from "node:crypto";
import sharp, { type Metadata } from "sharp";
import { getDb } from "@sgela/db";
import { getStorage } from "@/lib/storage";

/**
 * Learner profile photos (D-025).
 * - Accepts JPEG, PNG or WebP up to 5 MB (checked by decoding, not by file name or MIME).
 * - Re-encodes to a 512 x 512 WebP: EXIF orientation applied, all metadata (GPS, camera)
 *   dropped, so a phone photo never leaks where it was taken.
 * - Private: served only to the learner themself (/api/v1/me/avatar); never shown to
 *   sponsors, coaches or other learners. Under-18s are covered by the same rule.
 */
export const AVATAR_MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = new Set(["jpeg", "png", "webp"]);

export type AvatarError = "TOO_BIG" | "NOT_AN_IMAGE" | "TOO_SMALL";

export class AvatarRejected extends Error {
  constructor(readonly code: AvatarError) {
    super(code);
  }
}

/** Validate and normalise an uploaded photo. Throws AvatarRejected on bad input. */
export async function processAvatar(input: Buffer): Promise<Buffer> {
  if (input.byteLength > AVATAR_MAX_BYTES) throw new AvatarRejected("TOO_BIG");
  let meta: Metadata;
  try {
    meta = await sharp(input, { limitInputPixels: 40_000_000 }).metadata();
  } catch {
    throw new AvatarRejected("NOT_AN_IMAGE");
  }
  if (!meta.format || !ALLOWED.has(meta.format)) throw new AvatarRejected("NOT_AN_IMAGE");
  if ((meta.width ?? 0) < 64 || (meta.height ?? 0) < 64) throw new AvatarRejected("TOO_SMALL");
  return sharp(input, { limitInputPixels: 40_000_000 })
    .rotate()
    .resize(512, 512, { fit: "cover", position: "attention" })
    .webp({ quality: 80 })
    .toBuffer();
}

/** URL for the learner's own photo, versioned so a new upload busts the browser cache. */
export function avatarUrlFor(learner: {
  avatarKey: string | null;
  avatarUpdatedAt: Date | null;
}): string | undefined {
  if (!learner.avatarKey) return undefined;
  return "/api/v1/me/avatar?v=" + (learner.avatarUpdatedAt?.getTime() ?? 0);
}

export async function setAvatar(learnerId: string, input: Buffer, now = new Date()) {
  const webp = await processAvatar(input);
  const db = getDb();
  const key = `avatars/${learnerId}/${randomBytes(8).toString("hex")}.webp`;
  const storage = getStorage();
  await storage.put(key, webp, "image/webp");
  const prev = await db.learner.findUnique({
    where: { id: learnerId },
    select: { avatarKey: true },
  });
  await db.learner.update({
    where: { id: learnerId },
    data: { avatarKey: key, avatarUpdatedAt: now },
  });
  if (prev?.avatarKey && prev.avatarKey !== key) await storage.delete(prev.avatarKey);
  return key;
}

export async function removeAvatar(learnerId: string) {
  const db = getDb();
  const prev = await db.learner.findUnique({
    where: { id: learnerId },
    select: { avatarKey: true },
  });
  await db.learner.update({
    where: { id: learnerId },
    data: { avatarKey: null, avatarUpdatedAt: null },
  });
  if (prev?.avatarKey) await getStorage().delete(prev.avatarKey);
}
