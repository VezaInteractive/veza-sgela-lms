/** SA provinces (PRD §11.1 provinceCode) and the 52 district/metro municipalities (MDB codes). */
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

export interface District {
  /** Municipal Demarcation Board code: DCnn for districts, three letters for metros. */
  code: string;
  name: string;
  provinceCode: ProvinceCode;
  metro: boolean;
}

const d = (code: string, name: string, provinceCode: ProvinceCode, metro = false): District => ({
  code,
  name,
  provinceCode,
  metro,
});

/** 8 metropolitan + 44 district municipalities (MDB, 2016 boundaries). */
export const DISTRICTS: readonly District[] = [
  // Eastern Cape (8)
  d("BUF", "Buffalo City", "EC", true),
  d("NMA", "Nelson Mandela Bay", "EC", true),
  d("DC10", "Sarah Baartman", "EC"),
  d("DC12", "Amathole", "EC"),
  d("DC13", "Chris Hani", "EC"),
  d("DC14", "Joe Gqabi", "EC"),
  d("DC15", "O.R. Tambo", "EC"),
  d("DC44", "Alfred Nzo", "EC"),
  // Free State (5)
  d("MAN", "Mangaung", "FS", true),
  d("DC16", "Xhariep", "FS"),
  d("DC18", "Lejweleputswa", "FS"),
  d("DC19", "Thabo Mofutsanyana", "FS"),
  d("DC20", "Fezile Dabi", "FS"),
  // Gauteng (5)
  d("JHB", "City of Johannesburg", "GP", true),
  d("TSH", "City of Tshwane", "GP", true),
  d("EKU", "Ekurhuleni", "GP", true),
  d("DC42", "Sedibeng", "GP"),
  d("DC48", "West Rand", "GP"),
  // KwaZulu-Natal (11)
  d("ETH", "eThekwini", "KZN", true),
  d("DC21", "Ugu", "KZN"),
  d("DC22", "uMgungundlovu", "KZN"),
  d("DC23", "uThukela", "KZN"),
  d("DC24", "uMzinyathi", "KZN"),
  d("DC25", "Amajuba", "KZN"),
  d("DC26", "Zululand", "KZN"),
  d("DC27", "uMkhanyakude", "KZN"),
  d("DC28", "King Cetshwayo", "KZN"),
  d("DC29", "iLembe", "KZN"),
  d("DC43", "Harry Gwala", "KZN"),
  // Limpopo (5)
  d("DC33", "Mopani", "LP"),
  d("DC34", "Vhembe", "LP"),
  d("DC35", "Capricorn", "LP"),
  d("DC36", "Waterberg", "LP"),
  d("DC47", "Sekhukhune", "LP"),
  // Mpumalanga (3)
  d("DC30", "Gert Sibande", "MP"),
  d("DC31", "Nkangala", "MP"),
  d("DC32", "Ehlanzeni", "MP"),
  // Northern Cape (5)
  d("DC6", "Namakwa", "NC"),
  d("DC7", "Pixley ka Seme", "NC"),
  d("DC8", "ZF Mgcawu", "NC"),
  d("DC9", "Frances Baard", "NC"),
  d("DC45", "John Taolo Gaetsewe", "NC"),
  // North West (4)
  d("DC37", "Bojanala Platinum", "NW"),
  d("DC38", "Ngaka Modiri Molema", "NW"),
  d("DC39", "Dr Ruth Segomotsi Mompati", "NW"),
  d("DC40", "Dr Kenneth Kaunda", "NW"),
  // Western Cape (6)
  d("CPT", "City of Cape Town", "WC", true),
  d("DC1", "West Coast", "WC"),
  d("DC2", "Cape Winelands", "WC"),
  d("DC3", "Overberg", "WC"),
  d("DC4", "Garden Route", "WC"),
  d("DC5", "Central Karoo", "WC"),
];

export function districtsForProvince(provinceCode: string): District[] {
  return DISTRICTS.filter((x) => x.provinceCode === provinceCode);
}

export function getDistrict(code: string): District | undefined {
  return DISTRICTS.find((x) => x.code === code);
}

/** True when the district exists and belongs to the province. */
export function isDistrictInProvince(districtCode: string, provinceCode: string): boolean {
  return getDistrict(districtCode)?.provinceCode === provinceCode;
}
