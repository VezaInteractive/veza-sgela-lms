"use server";

import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { trackEvent } from "@/lib/analytics/server";
import { AuthError, requireRole } from "@/lib/auth/rbac";
import {
  audit,
  careerSchema,
  codes,
  deleteCareer,
  industrySchema,
  lines,
  parseRoutes,
  saveCareer,
  updateIndustry,
} from "@/lib/admin/catalog";

/** Admin-only guard for every catalogue action (A-2). Learners never reach here. */
async function requireAdmin() {
  try {
    return await requireRole("ADMIN", "SUPER_ADMIN");
  } catch (err) {
    if (err instanceof AuthError) notFound();
    throw err;
  }
}

function refreshExplore(code: string, slug?: string) {
  revalidatePath("/admin/careers");
  revalidatePath("/explore");
  revalidatePath("/explore/" + code.toLowerCase());
  if (slug) revalidatePath(`/explore/${code.toLowerCase()}/careers/${slug}`);
}

export async function saveIndustryAction(formData: FormData) {
  const session = await requireAdmin();
  const code = String(formData.get("code") ?? "").toUpperCase();
  const parsed = industrySchema.safeParse({
    name: formData.get("name"),
    tagline: formData.get("tagline"),
    color: formData.get("color"),
    sortOrder: formData.get("sortOrder"),
    vrSummary: formData.get("vrSummary"),
    whyItMatters: lines(formData.get("whyItMatters")),
    sponsorOrgId: formData.get("sponsorOrgId"),
    heroAssetId: formData.get("heroAssetId"),
  });
  const base = "/admin/careers/world/" + code.toLowerCase();
  if (!parsed.success) redirect(base + "?error=invalid");
  await updateIndustry(code, parsed.data);
  await audit(session.user.id, "industry.update", "Industry", code, { name: parsed.data.name });
  await trackEvent({ name: "admin_industry_updated", userId: session.user.id, props: { code } });
  refreshExplore(code);
  redirect("/admin/careers?ok=world");
}

export async function saveCareerAction(formData: FormData) {
  const session = await requireAdmin();
  const existingId = String(formData.get("id") ?? "") || null;
  const roleName = String(formData.get("roleName") ?? "").trim();
  const parsed = careerSchema.safeParse({
    slug: formData.get("slug"),
    industryCode: String(formData.get("industryCode") ?? "").toUpperCase(),
    title: formData.get("title"),
    summary: formData.get("summary"),
    salaryBandNote: formData.get("salaryBandNote"),
    dayInLife: lines(formData.get("dayInLife")),
    studyRoutes: parseRoutes(formData.get("studyRoutes")),
    subjectsRequired: codes(formData.get("subjectsRequired")),
    subjectsRecommended: codes(formData.get("subjectsRecommended")),
    sortOrder: formData.get("sortOrder"),
    roleModel: roleName
      ? {
          name: roleName,
          place: String(formData.get("rolePlace") ?? "").trim(),
          story: String(formData.get("roleStory") ?? "").trim(),
        }
      : null,
  });
  const back = existingId
    ? "/admin/careers/edit/" + String(formData.get("slug") ?? "")
    : "/admin/careers/new";
  if (!parsed.success) redirect(back + "?error=invalid");

  const res = await saveCareer(parsed.data, existingId);
  if (!res.ok) redirect(back + "?error=slugTaken");
  await audit(session.user.id, existingId ? "career.update" : "career.create", "Career", res.id, {
    slug: parsed.data.slug,
  });
  await trackEvent({
    name: existingId ? "admin_career_updated" : "admin_career_created",
    userId: session.user.id,
    props: { slug: parsed.data.slug, world: parsed.data.industryCode },
  });
  refreshExplore(parsed.data.industryCode, parsed.data.slug);
  redirect("/admin/careers?ok=" + (existingId ? "careerUpdated" : "careerCreated"));
}

export async function deleteCareerAction(formData: FormData) {
  const session = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const slug = String(formData.get("slug") ?? "");
  const code = String(formData.get("industryCode") ?? "").toUpperCase();
  if (!id) notFound();
  await deleteCareer(id);
  await audit(session.user.id, "career.delete", "Career", id, { slug });
  await trackEvent({
    name: "admin_career_deleted",
    userId: session.user.id,
    props: { slug, world: code },
  });
  refreshExplore(code, slug);
  redirect("/admin/careers?ok=deleted");
}
