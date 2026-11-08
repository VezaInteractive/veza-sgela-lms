/**
 * Seed skeleton (M0-3). Idempotent upserts only. Full seed per PRD §18.1
 * (districts, schools, careers, courses, synthetic learners/signals) lands in M1–M7.
 * Sponsor/partner names must be fictional; Bantu and Veza are the only real orgs.
 */
import "dotenv/config";
import { DISTRICTS } from "@sgela/geo";
import { getDb } from "../src/index";

const db = getDb();

const INDUSTRIES = [
  {
    code: "AVI",
    name: "Aviation",
    tagline: "Take off into flight, maintenance and air traffic careers",
    color: "#4FA3FF",
    sortOrder: 1,
  },
  {
    code: "ENG",
    name: "Engineering",
    tagline: "Build, wire, repair and power South Africa",
    color: "#FFB547",
    sortOrder: 2,
  },
  {
    code: "CUL",
    name: "Culinary skills",
    tagline: "From prep line to head chef",
    color: "#FF6B5A",
    sortOrder: 3,
  },
  {
    code: "MED",
    name: "Medical & health facilities",
    tagline: "Care, diagnose and keep clinics running",
    color: "#3FD1B5",
    sortOrder: 4,
  },
  {
    code: "AGR",
    name: "Sustainable agriculture",
    tagline: "Grow food smarter with soil, water and tech",
    color: "#ABCF37",
    sortOrder: 5,
  },
] as const;

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
  for (const i of INDUSTRIES) {
    await db.industry.upsert({
      where: { code: i.code },
      update: { name: i.name, tagline: i.tagline, color: i.color, sortOrder: i.sortOrder },
      create: { ...i, whyItMatters: [] },
    });
  }

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
  for (const o of orgs) {
    await db.organisation.upsert({ where: { id: o.id }, update: { name: o.name }, create: o });
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
    `Seeded ${INDUSTRIES.length} industries, ${SUBJECTS.length} subjects, ${orgs.length} orgs, ${schoolCount} sample schools, 1 admin.`,
  );
}

main()
  .then(() => db.$disconnect())
  .catch(async (err) => {
    console.error(err);
    await db.$disconnect();
    process.exit(1);
  });
