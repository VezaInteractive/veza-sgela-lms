import { z } from "zod";
import { getDb, type PrismaClient } from "@sgela/db";

/**
 * Admin worlds and careers service (A-2, M2-1). Pure parsing plus DB writes; every write is
 * audit-logged by the caller. RBAC is enforced in the server actions, never here.
 */

const HEX = /^#[0-9a-fA-F]{6}$/;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ROUTE_TYPES = ["TVET", "UNIVERSITY", "LEARNERSHIP", "SHORT_COURSE"] as const;

/** Split a textarea into trimmed, non-empty lines. */
export function lines(v: FormDataEntryValue | null): string[] {
  return String(v ?? "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Split a comma or newline list of subject codes, upper-cased. */
export function codes(v: FormDataEntryValue | null): string[] {
  return String(v ?? "")
    .split(/[\n,]/)
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);
}

/** Parse "TYPE | label" lines into study routes; bad type falls back to SHORT_COURSE. */
export function parseRoutes(v: FormDataEntryValue | null): { type: string; label: string }[] {
  return lines(v).flatMap((line) => {
    const [rawType, ...rest] = line.split("|");
    const label = rest.join("|").trim();
    if (!label) return [];
    const type = (ROUTE_TYPES as readonly string[]).includes((rawType ?? "").trim().toUpperCase())
      ? (rawType ?? "").trim().toUpperCase()
      : "SHORT_COURSE";
    return [{ type, label }];
  });
}

export const industrySchema = z.object({
  name: z.string().trim().min(2).max(80),
  tagline: z.string().trim().min(2).max(160),
  color: z.string().regex(HEX),
  sortOrder: z.coerce.number().int().min(0).max(999),
  vrSummary: z.string().trim().max(400).optional().or(z.literal("")),
  whyItMatters: z.array(z.string().max(300)).max(5),
  sponsorOrgId: z.string().trim().optional().or(z.literal("")),
  heroAssetId: z.string().trim().optional().or(z.literal("")),
});

export const careerSchema = z.object({
  slug: z.string().trim().regex(SLUG).max(80),
  industryCode: z.string().trim().length(3),
  title: z.string().trim().min(2).max(120),
  summary: z.string().trim().min(2).max(400),
  salaryBandNote: z.string().trim().max(240).optional().or(z.literal("")),
  dayInLife: z.array(z.string().max(300)).min(1).max(6),
  studyRoutes: z
    .array(z.object({ type: z.string(), label: z.string() }))
    .min(1)
    .max(8),
  subjectsRequired: z.array(z.string()).max(12),
  subjectsRecommended: z.array(z.string()).max(12),
  sortOrder: z.coerce.number().int().min(0).max(999),
  roleModel: z
    .object({ name: z.string().max(80), place: z.string().max(80), story: z.string().max(400) })
    .nullable(),
});

export type IndustryInput = z.infer<typeof industrySchema>;
export type CareerInput = z.infer<typeof careerSchema>;

export async function updateIndustry(
  code: string,
  input: IndustryInput,
  db: PrismaClient = getDb(),
): Promise<void> {
  await db.industry.update({
    where: { code },
    data: {
      name: input.name,
      tagline: input.tagline,
      color: input.color,
      sortOrder: input.sortOrder,
      vrSummary: input.vrSummary || null,
      whyItMatters: input.whyItMatters,
      sponsorOrgId: input.sponsorOrgId || null,
      heroAssetId: input.heroAssetId || null,
    },
  });
}

/** Create or update a career. Returns SLUG_TAKEN if the slug belongs to another career. */
export async function saveCareer(
  input: CareerInput,
  existingId: string | null,
  db: PrismaClient = getDb(),
): Promise<{ ok: true; id: string } | { ok: false; code: "SLUG_TAKEN" }> {
  const clash = await db.career.findUnique({ where: { slug: input.slug }, select: { id: true } });
  if (clash && clash.id !== existingId) return { ok: false, code: "SLUG_TAKEN" };
  const data = {
    slug: input.slug,
    industryCode: input.industryCode,
    title: input.title,
    summary: input.summary,
    dayInLife: input.dayInLife,
    studyRoutes: input.studyRoutes,
    subjectsRequired: input.subjectsRequired,
    subjectsRecommended: input.subjectsRecommended,
    salaryBandNote: input.salaryBandNote || null,
    sortOrder: input.sortOrder,
    roleModel: input.roleModel ?? undefined,
  };
  const row = existingId
    ? await db.career.update({ where: { id: existingId }, data })
    : await db.career.create({ data });
  return { ok: true, id: row.id };
}

export async function deleteCareer(id: string, db: PrismaClient = getDb()): Promise<void> {
  await db.career.delete({ where: { id } });
}

/** Append an admin audit record (PRD 19.2). */
export async function audit(
  actorId: string,
  action: string,
  targetType: string,
  targetId: string,
  meta?: Record<string, unknown>,
  db: PrismaClient = getDb(),
): Promise<void> {
  await db.auditLog.create({
    data: { actorId, action, targetType, targetId, meta: (meta ?? {}) as never },
  });
}
