/**
 * Helpers for career content stored as JSON (D-032). Pure, so they are unit tested; Vitest
 * cannot load .tsx, so this logic stays in a .ts file.
 */

export const ROUTE_TYPES = ["TVET", "UNIVERSITY", "LEARNERSHIP", "SHORT_COURSE"] as const;
export type RouteType = (typeof ROUTE_TYPES)[number];

export function stringList(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
}

export function routesOf(v: unknown): { type: RouteType; label: string }[] {
  if (!Array.isArray(v)) return [];
  return v.flatMap((r) => {
    if (!r || typeof r !== "object") return [];
    const o = r as Record<string, unknown>;
    if (typeof o.label !== "string") return [];
    const type = (ROUTE_TYPES as readonly string[]).includes(o.type as string)
      ? (o.type as RouteType)
      : "SHORT_COURSE";
    return [{ type, label: o.label }];
  });
}

export function roleModelOf(v: unknown): { name: string; place: string; story: string } | null {
  if (!v || typeof v !== "object") return null;
  const r = v as Record<string, unknown>;
  if (typeof r.name !== "string" || typeof r.story !== "string") return null;
  return { name: r.name, place: typeof r.place === "string" ? r.place : "", story: r.story };
}

/**
 * Overlay a locale's translated fields on the English base. Only keys present in `base` are
 * taken, and only with the same shape (string or string list), so bad JSON falls back to English.
 */
export function localise<T extends Record<string, string | string[]>>(
  translations: unknown,
  locale: string,
  base: T,
): T {
  if (locale === "en" || !translations || typeof translations !== "object") return base;
  const over = (translations as Record<string, unknown>)[locale];
  if (!over || typeof over !== "object") return base;
  const out = { ...base };
  for (const key of Object.keys(base) as (keyof T)[]) {
    const v = (over as Record<string, unknown>)[key as string];
    if (Array.isArray(base[key])) {
      const list = stringList(v);
      if (list.length) out[key] = list as T[keyof T];
    } else if (typeof v === "string" && v.trim()) {
      out[key] = v as T[keyof T];
    }
  }
  return out;
}
