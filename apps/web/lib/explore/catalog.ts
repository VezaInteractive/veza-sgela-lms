import { getDb, type PrismaClient } from "@sgela/db";
import { localise, roleModelOf, routesOf, stringList } from "./content";

/**
 * DB-backed career worlds and careers (M2-1/M2-4). Content is admin-edited English with optional
 * per-locale overrides in `translations` (D-032); nothing returned here is learner data.
 */

const assetSelect = {
  select: { id: true, name: true, glbUrl: true, glbSizeBytes: true, posterUrl: true },
} as const;

export interface HeroAsset {
  id: string;
  name: string;
  glbUrl: string;
  glbSizeBytes: number;
  posterUrl: string;
}

export async function listWorlds(locale: string, db: PrismaClient = getDb()) {
  const rows = await db.industry.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      sponsorOrg: { select: { name: true } },
      _count: { select: { careers: true } },
    },
  });
  return rows.map((w) => {
    const t = localise(w.translations, locale, { tagline: w.tagline });
    return {
      code: w.code,
      name: w.name,
      color: w.color,
      tagline: t.tagline,
      sponsor: w.sponsorOrg?.name ?? null,
      careerCount: w._count.careers,
    };
  });
}

export type WorldSummary = Awaited<ReturnType<typeof listWorlds>>[number];

type CareerRow = Awaited<ReturnType<PrismaClient["career"]["findMany"]>>[number];

function careerView(c: CareerRow, locale: string) {
  const t = localise(c.translations, locale, {
    title: c.title,
    summary: c.summary,
    dayInLife: stringList(c.dayInLife),
    salaryBandNote: c.salaryBandNote ?? "",
  });
  return {
    id: c.id,
    slug: c.slug,
    industryCode: c.industryCode,
    ...t,
    studyRoutes: routesOf(c.studyRoutes),
    subjectsRequired: c.subjectsRequired,
    subjectsRecommended: c.subjectsRecommended,
    roleModel: roleModelOf(c.roleModel),
  };
}

export type CareerView = ReturnType<typeof careerView>;

export async function getWorld(code: string, locale: string, db: PrismaClient = getDb()) {
  const w = await db.industry.findUnique({
    where: { code: code.toUpperCase() },
    include: {
      sponsorOrg: { select: { id: true, name: true } },
      heroAsset: assetSelect,
      careers: { orderBy: [{ sortOrder: "asc" }, { title: "asc" }] },
    },
  });
  if (!w) return null;
  const t = localise(w.translations, locale, {
    tagline: w.tagline,
    vrSummary: w.vrSummary ?? "",
    whyItMatters: stringList(w.whyItMatters),
  });
  return {
    code: w.code,
    name: w.name,
    color: w.color,
    ...t,
    sponsor: w.sponsorOrg,
    heroAsset: w.heroAsset as HeroAsset | null,
    careers: w.careers.map((c) => careerView(c, locale)),
  };
}

export async function getCareer(
  industry: string,
  slug: string,
  locale: string,
  db: PrismaClient = getDb(),
) {
  const c = await db.career.findUnique({
    where: { slug },
    include: {
      heroAsset: assetSelect,
      industry: {
        select: { code: true, color: true, sponsorOrg: { select: { id: true, name: true } } },
      },
    },
  });
  if (!c || c.industryCode !== industry.toUpperCase()) return null;
  return {
    ...careerView(c, locale),
    heroAsset: c.heroAsset as HeroAsset | null,
    world: { code: c.industry.code, color: c.industry.color, sponsor: c.industry.sponsorOrg },
  };
}
