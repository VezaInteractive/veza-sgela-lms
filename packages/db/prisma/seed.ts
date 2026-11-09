/**
 * Seed skeleton (M0-3). Idempotent upserts only. Full seed per PRD §18.1
 * (districts, schools, careers, courses, synthetic learners/signals) lands in M1–M7.
 * Sponsor/partner names must be fictional; Bantu and Veza are the only real orgs.
 */
import "dotenv/config";
import { existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { DISTRICTS } from "@sgela/geo";
import { getDb } from "../src/index";
import { CATALOG, SEED_ASSETS, SEED_SPONSORS } from "./catalog";

const db = getDb();

const MODELS_DIR = join(import.meta.dirname, "..", "..", "..", "apps", "web", "public", "models");

function fileSize(name: string): number {
  const p = join(MODELS_DIR, name);
  return existsSync(p) ? statSync(p).size : 0;
}

const SUBJECTS = [
  ["MATHEMATICS", "Mathematics"],
  ["MATHEMATICAL_LITERACY", "Mathematical Literacy"],
  ["PHYSICAL_SCIENCE", "Physical Sciences"],
  ["LIFE_SCIENCES", "Life Sciences"],
  ["AGRICULTURAL_SCIENCES", "Agricultural Sciences"],
  ["EGD", "Engineering Graphics and Design"],
  ["HOSPITALITY_STUDIES", "Hospitality Studies"],
  ["CONSUMER_STUDIES", "Consumer Studies"],
  ["ACCOUNTING", "Accounting"],
  ["IT", "Information Technology"],
  ["CAT", "Computer Applications Technology"],
  ["ENGLISH", "English"],
] as const;

async function main() {
  for (const [code, name] of SUBJECTS) {
    await db.subject.upsert({ where: { code }, update: { name }, create: { code, name } });
  }

  const orgs = [
    { id: "org_veza", name: "Veza Interactive", type: "VEZA" as const },
    {
      id: "org_bantu",
      name: "Bantu Marketing and Management Services",
      type: "ACCREDITATION_PARTNER" as const,
    },
  ];
  for (const o of [...orgs, ...SEED_SPONSORS]) {
    await db.organisation.upsert({ where: { id: o.id }, update: { name: o.name }, create: o });
  }

  // Seed 3D hero objects (M2-2), one per world; files come from `pnpm --filter @sgela/web models:seed`.
  const assetIds = new Map<string, string>();
  for (const a of SEED_ASSETS) {
    const data = {
      name: a.name,
      industryCode: a.industryCode,
      glbUrl: "/models/" + a.file + ".glb",
      glbSizeBytes: fileSize(a.file + ".glb"),
      posterUrl: "/models/" + a.file + ".webp",
      hotspots: [],
      explodeGroups: [],
      components: [],
      license: "Veza seed asset (generated in code)",
      sourceNote: "apps/web/scripts/make-seed-models.ts",
      processingStatus: "READY" as const,
    };
    const row = await db.asset3D.upsert({
      where: { assetKey: a.key },
      update: data,
      create: { assetKey: a.key, ...data },
    });
    assetIds.set(a.key, row.id);
  }

  // Career worlds and careers (PRD 6.1/6.2, M2-1).
  let careerCount = 0;
  for (const ind of CATALOG) {
    const data = {
      name: ind.name,
      tagline: ind.tagline,
      whyItMatters: ind.whyItMatters,
      color: ind.color,
      sortOrder: ind.sortOrder,
      vrSummary: ind.vrSummary,
      sponsorOrgId: ind.sponsorOrgId ?? null,
      heroAssetId: assetIds.get(ind.heroAssetKey) ?? null,
    };
    await db.industry.upsert({
      where: { code: ind.code },
      update: data,
      create: { code: ind.code, ...data },
    });
    for (const [order, c] of ind.careers.entries()) {
      const career = {
        industryCode: ind.code,
        title: c.title,
        summary: c.summary,
        dayInLife: c.dayInLife,
        studyRoutes: c.studyRoutes,
        subjectsRequired: c.subjectsRequired,
        subjectsRecommended: c.subjectsRecommended,
        salaryBandNote: c.salaryBandNote,
        roleModel: c.roleModel ?? undefined,
        sortOrder: order + 1,
      };
      await db.career.upsert({
        where: { slug: c.slug },
        update: career,
        create: { slug: c.slug, ...career },
      });
      careerCount += 1;
    }
  }

  // Dev admin (PRD §18.1). Sign in at /start with 060 000 0001; the OTP prints to the dev server console.
  await db.user.upsert({
    where: { phoneE164: "+27600000001" },
    update: { role: "SUPER_ADMIN" },
    create: { phoneE164: "+27600000001", role: "SUPER_ADMIN" },
  });

  // Sample schools so the searchable school list works in dev (D-017). Names are generic
  // placeholders, not real schools; a real EMIS import replaces them before pilot.
  const kinds = ["Secondary School", "High School", "Technical High School"];
  let schoolCount = 0;
  for (const dist of DISTRICTS) {
    for (const [i, kind] of kinds.entries()) {
      const id = "sch_" + dist.code.toLowerCase() + "_" + (i + 1);
      const name = dist.name + " " + kind + " (sample)";
      await db.school.upsert({
        where: { id },
        update: { name },
        create: {
          id,
          name,
          provinceCode: dist.provinceCode,
          districtCode: dist.code,
          quintile: (i % 5) + 1,
        },
      });
      schoolCount += 1;
    }
  }

  const settings: Record<string, unknown> = {
    "privacy.minCellSize": 20,
    "claim.expiryDays": 30,
    "quiz.defaultPassMark": 70,
  };
  for (const [key, value] of Object.entries(settings)) {
    await db.setting.upsert({
      where: { key },
      update: { value: value as never },
      create: { key, value: value as never },
    });
  }

  console.info(
    `Seeded ${CATALOG.length} industries, ${careerCount} careers, ${SEED_ASSETS.length} 3D assets, ${SUBJECTS.length} subjects, ${orgs.length} orgs, ${schoolCount} sample schools, 1 admin.`,
  );
}

main()
  .then(() => db.$disconnect())
  .catch(async (err) => {
    console.error(err);
    await db.$disconnect();
    process.exit(1);
  });
