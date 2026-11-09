"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "@sgela/db";
import { trackEvent } from "@/lib/analytics/server";
import { requireSession } from "@/lib/auth/rbac";
import { setInterest } from "@/lib/interest/service";

/**
 * "I'm interested" toggle on worlds and careers (L-EX-4, M2-5). A plain form post, so it works
 * without JavaScript. The learner comes from the server session only; the world and career are
 * checked against the DB, never trusted from the form.
 */
export async function toggleInterestAction(formData: FormData) {
  const session = await requireSession();
  const learner = session.user.learner;
  if (!learner) return;
  const industry = String(formData.get("industry") ?? "").toUpperCase();
  const careerSlug = String(formData.get("career") ?? "");
  const on = formData.get("on") === "1";
  const db = getDb();

  const world = await db.industry.findUnique({
    where: { code: industry },
    select: { code: true, sponsorOrgId: true },
  });
  if (!world) return;
  let careerId: string | undefined;
  if (careerSlug) {
    const career = await db.career.findUnique({
      where: { slug: careerSlug },
      select: { id: true, industryCode: true },
    });
    if (!career || career.industryCode !== world.code) return;
    careerId = career.id;
  }

  const res = await setInterest(learner.id, {
    industryCode: world.code,
    careerId,
    on,
    sponsorOrgId: world.sponsorOrgId,
  });
  await trackEvent({
    name: careerId ? "career_interest_toggled" : "world_interest_toggled",
    userId: session.user.id,
    props: { world: world.code, career: careerSlug || null, on: res.on },
  });
  const base = "/explore/" + world.code.toLowerCase();
  revalidatePath(careerSlug ? base + "/careers/" + careerSlug : base);
  revalidatePath("/explore");
  revalidatePath("/home");
}
