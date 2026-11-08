/** SA provinces (PRD §11.1 provinceCode). Districts (52 MDB codes) + TopoJSON land in M1/M7. */
export const PROVINCES = [
  { code: "EC", name: "Eastern Cape" },
  { code: "FS", name: "Free State" },
  { code: "GP", name: "Gauteng" },
  { code: "KZN", name: "KwaZulu-Natal" },
  { code: "LP", name: "Limpopo" },
  { code: "MP", name: "Mpumalanga" },
  { code: "NC", name: "Northern Cape" },
  { code: "NW", name: "North West" },
  { code: "WC", name: "Western Cape" },
] as const;

export type ProvinceCode = (typeof PROVINCES)[number]["code"];

export function isProvinceCode(value: string): value is ProvinceCode {
  return PROVINCES.some((p) => p.code === value);
}
