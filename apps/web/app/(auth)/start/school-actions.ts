"use server";

import { getDb } from "@sgela/db";
import { getDistrict } from "@sgela/geo";
import { getCurrentSession } from "@/lib/auth/session";

/** School names for the searchable list (signed-in users only; school names are public data). */
export async function schoolsForDistrict(districtCode: string): Promise<string[]> {
  if (!(await getCurrentSession()) || !getDistrict(districtCode)) return [];
  const rows = await getDb().school.findMany({
    where: { districtCode },
    orderBy: { name: "asc" },
    select: { name: true },
    take: 500,
  });
  return rows.map((r) => r.name);
}
