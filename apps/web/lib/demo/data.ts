/**
 * Clickable-demo sample content (D-018). Shows every learner section before its milestone
 * (M2 Compass/Explore, M3 Learn, M4 credentials, M5 Opportunities) is built for real.
 * All sponsor and partner names are fictional; only Bantu and Veza are real organisations.
 * Replace each block with DB-backed data in its milestone.
 */
export type WorldCode = "AVI" | "ENG" | "CUL" | "MED" | "AGR";

export interface Career {
  slug: string;
  title: string;
  summary: string;
  salary: string;
  routes: string[];
  subjects: string[];
}

export interface World {
  code: WorldCode;
  name: string;
  tagline: string;
  why: string[];
  subjects: string[];
  careers: Career[];
}

export const WORLDS: World[] = [
  {
    code: "AVI",
    name: "Aviation",
    tagline: "Take off into flight, maintenance and air traffic careers",
    why: [
      "SA airlines and airports need pilots, technicians and controllers.",
      "Drone (RPAS) work is growing fast in mining, farming and film.",
    ],
    subjects: ["MATHEMATICS", "PHYSICAL_SCIENCE", "ENGLISH"],
    careers: [
      {
        slug: "commercial-pilot",
        title: "Commercial pilot",
        summary: "Fly passengers and cargo safely on scheduled routes.",
        salary: "R25k to R120k per month (placeholder)",
        routes: ["Flight school (CPL)", "Airline cadet programme"],
        subjects: ["MATHEMATICS", "PHYSICAL_SCIENCE"],
      },
      {
        slug: "aircraft-maintenance-engineer",
        title: "Aircraft maintenance engineer",
        summary: "Inspect, repair and certify aircraft before every flight.",
        salary: "R18k to R60k per month (placeholder)",
        routes: ["TVET N-levels + apprenticeship", "AMO learnership"],
        subjects: ["MATHEMATICS", "PHYSICAL_SCIENCE"],
      },
      {
        slug: "drone-pilot",
        title: "Drone (RPAS) pilot",
        summary: "Plan and fly drone missions for surveys and inspections.",
        salary: "R12k to R35k per month (placeholder)",
        routes: ["Remote pilot licence short course"],
        subjects: ["MATHEMATICS"],
      },
    ],
  },
  {
    code: "ENG",
    name: "Engineering",
    tagline: "Build, wire, repair and power South Africa",
    why: [
      "Artisans are scarce skills on the national list.",
      "Renewable energy projects need technicians in every province.",
    ],
    subjects: ["MATHEMATICS", "PHYSICAL_SCIENCE", "EGD"],
    careers: [
      {
        slug: "electrician",
        title: "Electrician",
        summary: "Install and test wiring, panels and machines safely.",
        salary: "R12k to R40k per month (placeholder)",
        routes: ["TVET NCV Electrical", "Trade test after apprenticeship"],
        subjects: ["MATHEMATICS", "PHYSICAL_SCIENCE"],
      },
      {
        slug: "renewable-energy-technician",
        title: "Renewable energy technician",
        summary: "Install and maintain solar and wind systems.",
        salary: "R14k to R38k per month (placeholder)",
        routes: ["Solar PV installer course", "TVET N-levels"],
        subjects: ["MATHEMATICS", "PHYSICAL_SCIENCE"],
      },
      {
        slug: "carpenter",
        title: "Carpenter / joiner",
        summary: "Build roofs, frames and furniture to plan.",
        salary: "R9k to R28k per month (placeholder)",
        routes: ["Bantu skills programme", "Apprenticeship"],
        subjects: ["MATHEMATICS"],
      },
    ],
  },
  {
    code: "CUL",
    name: "Culinary",
    tagline: "From prep line to head chef",
    why: [
      "Tourism and hospitality employ hundreds of thousands of young people.",
      "Kitchen skills travel: hotels, lodges, cruise ships, your own business.",
    ],
    subjects: ["HOSPITALITY_STUDIES", "CONSUMER_STUDIES", "MATHEMATICAL_LITERACY"],
    careers: [
      {
        slug: "chef",
        title: "Chef",
        summary: "Run a kitchen section and cook to a standard every day.",
        salary: "R8k to R45k per month (placeholder)",
        routes: ["Culinary school diploma", "Hotel learnership"],
        subjects: ["HOSPITALITY_STUDIES"],
      },
      {
        slug: "food-safety-officer",
        title: "Food safety officer",
        summary: "Check hygiene and safety in kitchens and factories.",
        salary: "R15k to R35k per month (placeholder)",
        routes: ["Diploma in food technology"],
        subjects: ["LIFE_SCIENCES", "CONSUMER_STUDIES"],
      },
    ],
  },
  {
    code: "MED",
    name: "Medical",
    tagline: "Care, diagnose and keep clinics running",
    why: [
      "Clinics in every district need nurses and emergency care practitioners.",
      "Health tech roles grow as hospitals add digital equipment.",
    ],
    subjects: ["LIFE_SCIENCES", "PHYSICAL_SCIENCE", "MATHEMATICS"],
    careers: [
      {
        slug: "professional-nurse",
        title: "Professional nurse",
        summary: "Care for patients and run ward routines.",
        salary: "R20k to R45k per month (placeholder)",
        routes: ["Bachelor of Nursing", "Nursing college diploma"],
        subjects: ["LIFE_SCIENCES", "PHYSICAL_SCIENCE"],
      },
      {
        slug: "emergency-care-practitioner",
        title: "Emergency care practitioner",
        summary: "Respond to emergencies and stabilise patients.",
        salary: "R18k to R40k per month (placeholder)",
        routes: ["Diploma in emergency medical care"],
        subjects: ["LIFE_SCIENCES", "MATHEMATICS"],
      },
      {
        slug: "pharmacist-assistant",
        title: "Pharmacist assistant",
        summary: "Prepare and hand out medicine under supervision.",
        salary: "R9k to R20k per month (placeholder)",
        routes: ["Pharmacy assistant learnership"],
        subjects: ["LIFE_SCIENCES"],
      },
    ],
  },
  {
    code: "AGR",
    name: "Agriculture",
    tagline: "Grow food smarter with soil, water and tech",
    why: [
      "Accredited through Bantu: the first credit-bearing pathway on Sgela.",
      "Smart farming creates jobs close to home in rural districts.",
    ],
    subjects: ["AGRICULTURAL_SCIENCES", "LIFE_SCIENCES", "MATHEMATICS"],
    careers: [
      {
        slug: "farm-manager",
        title: "Farm manager",
        summary: "Plan crops, people and budgets on a working farm.",
        salary: "R15k to R50k per month (placeholder)",
        routes: ["Bantu agricultural skills programme", "Agri diploma"],
        subjects: ["AGRICULTURAL_SCIENCES", "MATHEMATICS"],
      },
      {
        slug: "hydroponics-technician",
        title: "Hydroponics technician",
        summary: "Run soil-free growing systems and nutrient mixes.",
        salary: "R10k to R25k per month (placeholder)",
        routes: ["Short course + on-farm training"],
        subjects: ["AGRICULTURAL_SCIENCES", "LIFE_SCIENCES"],
      },
      {
        slug: "agri-drone-operator",
        title: "Agri-drone operator",
        summary: "Map fields and spray crops with drones.",
        salary: "R12k to R30k per month (placeholder)",
        routes: ["Remote pilot licence + agri module"],
        subjects: ["MATHEMATICS", "AGRICULTURAL_SCIENCES"],
      },
    ],
  },
];

export function getWorld(code: string): World | undefined {
  return WORLDS.find((w) => w.code === code.toUpperCase());
}

export interface Course {
  slug: string;
  code: string;
  world: WorldCode | null;
  title: string;
  summary: string;
  minutes: number;
  accredited: boolean;
  progress: number;
  level: "intro" | "beginner" | "intermediate";
  credits: number;
  provider: string;
  resources: string[];
  topics: {
    title: string;
    minutes: number;
    status: "done" | "current" | "locked";
    has3d: boolean;
  }[];
}

export const COURSES: Course[] = [
  {
    slug: "agr-101",
    code: "AGR-101",
    world: "AGR",
    title: "Sustainable Agriculture Foundations",
    summary: "Soil, water, crops and hydroponics. Credit-bearing via Bantu.",
    minutes: 300,
    accredited: true,
    progress: 40,
    level: "beginner",
    credits: 12,
    provider: "Bantu (accredited partner)",
    resources: [
      "Soil testing kit guide (PDF)",
      "3D model: drip irrigation system",
      "Video: a day on a Limpopo co-op farm",
      "Hydroponics starter checklist",
    ],
    topics: [
      { title: "Soil health and testing", minutes: 60, status: "done", has3d: true },
      { title: "Water and irrigation", minutes: 60, status: "done", has3d: true },
      { title: "Crop planning", minutes: 50, status: "current", has3d: false },
      { title: "Hydroponics and protected farming", minutes: 70, status: "locked", has3d: true },
      { title: "Farm safety and business basics", minutes: 60, status: "locked", has3d: true },
    ],
  },
  {
    slug: "eng-101",
    code: "ENG-101",
    world: "ENG",
    title: "Repair and Maintain Electrical Power Tools",
    summary: "Take apart an angle grinder in 3D, test it and fix it safely.",
    minutes: 280,
    accredited: false,
    progress: 10,
    level: "beginner",
    credits: 0,
    provider: "Veza Interactive",
    resources: [
      "3D model: angle grinder, exploded view",
      "Workshop safety poster (PDF)",
      "Video: testing a power tool safely",
      "Fault-finding flowchart",
    ],
    topics: [
      { title: "Plan to repair and maintain", minutes: 45, status: "current", has3d: true },
      { title: "Prepare work area and safety", minutes: 55, status: "locked", has3d: true },
      { title: "Testing and fault-finding", minutes: 60, status: "locked", has3d: true },
      { title: "Repair and maintain", minutes: 70, status: "locked", has3d: true },
      { title: "Complete repairs and quality checks", minutes: 50, status: "locked", has3d: false },
    ],
  },
  {
    slug: "avi-starter",
    code: "AVI-001",
    world: "AVI",
    title: "A day as a pilot",
    summary: "Walk around a jet engine in 3D and learn the pre-flight checks.",
    minutes: 25,
    accredited: false,
    progress: 0,
    level: "intro",
    credits: 0,
    provider: "Veza Interactive",
    resources: [
      "3D model: jet engine walkaround",
      "Pre-flight checklist (PDF)",
      "Video: a pilot's first day",
    ],
    topics: [{ title: "Pre-flight walkaround", minutes: 25, status: "current", has3d: true }],
  },
  {
    slug: "med-starter",
    code: "MED-001",
    world: "MED",
    title: "A day in a hospital ward",
    summary: "Hand hygiene, triage and infection control in a 3D ward.",
    minutes: 25,
    accredited: false,
    progress: 0,
    level: "intro",
    credits: 0,
    provider: "Veza Interactive",
    resources: [
      "3D model: hospital ward",
      "Hand hygiene steps (PDF)",
      "Video: triage in a busy clinic",
    ],
    topics: [{ title: "Ward walkthrough", minutes: 25, status: "current", has3d: true }],
  },
  {
    slug: "ict-basics",
    code: "CR-ICT",
    world: null,
    title: "Career-Ready: ICT Basics",
    summary: "Email, documents and staying safe online. Bantu-aligned.",
    minutes: 90,
    accredited: true,
    progress: 0,
    level: "beginner",
    credits: 4,
    provider: "Bantu (accredited partner)",
    resources: [
      "Email and documents cheat sheet (PDF)",
      "Staying safe online quiz",
      "Video: writing your first CV",
    ],
    topics: [
      { title: "Using a computer and phone well", minutes: 45, status: "current", has3d: false },
      { title: "Safe and smart online", minutes: 45, status: "locked", has3d: false },
    ],
  },
];

export function getCourse(slug: string) {
  return COURSES.find((c) => c.slug === slug);
}

export interface Opportunity {
  id: string;
  title: string;
  sponsor: string;
  type: "Bursary" | "Learnership" | "Job shadow" | "Internship";
  world: WorldCode;
  provinces: string;
  closes: string;
  value: string;
  score: number;
  reasons: string[];
  gaps: string[];
}

/** Fictional sponsors (CLAUDE.md seed rule). */
export const OPPORTUNITIES: Opportunity[] = [
  {
    id: "op-1",
    title: "Grade 10-12 Aviation Bursary",
    sponsor: "Ubuntu Skies Aviation Trust",
    type: "Bursary",
    world: "AVI",
    provinces: "Limpopo, Gauteng",
    closes: "2027-02-28",
    value: "Fees + R1,500 monthly stipend",
    score: 82,
    reasons: ["Aviation interest from your expo", "Takes Physical Sciences", "Lives in Limpopo"],
    gaps: ["Finish Topic 1 of A day as a pilot"],
  },
  {
    id: "op-2",
    title: "Clinic Assistant Job Shadow (5 days)",
    sponsor: "Thusong Community Health Network",
    type: "Job shadow",
    world: "MED",
    provinces: "All provinces",
    closes: "2027-01-31",
    value: "Transport and meals covered",
    score: 74,
    reasons: ["Medical world played at the expo", "Grade 10-12"],
    gaps: ["Life Sciences recommended"],
  },
  {
    id: "op-3",
    title: "Smart Farming Learnership",
    sponsor: "Green Valley Agri Co-op",
    type: "Learnership",
    world: "AGR",
    provinces: "Limpopo, Mpumalanga",
    closes: "2027-03-15",
    value: "R3,200 monthly stipend, NQF 2 credits via Bantu",
    score: 61,
    reasons: ["Lives in Limpopo", "AGR-101 in progress"],
    gaps: ["Complete AGR-101 Topics 3-5", "Agricultural Sciences recommended"],
  },
  {
    id: "op-4",
    title: "Solar Installer Internship",
    sponsor: "Sunline Energy Works",
    type: "Internship",
    world: "ENG",
    provinces: "Gauteng, North West",
    closes: "2027-04-30",
    value: "R4,500 monthly stipend",
    score: 48,
    reasons: ["Takes Mathematics"],
    gaps: ["Engineering world not yet explored", "Must be 18 or older"],
  },
];

export const BADGES = [
  {
    code: "expo-explorer",
    name: "Expo explorer",
    description: "Played 2+ worlds at a Veza expo",
    earned: true,
  },
  {
    code: "first-topic",
    name: "First topic",
    description: "Finished your first topic",
    earned: true,
  },
  { code: "streak-7", name: "7-day streak", description: "Learned 7 days in a row", earned: false },
  {
    code: "3d-tinkerer",
    name: "3D tinkerer",
    description: "Explored 5 models in 3D",
    earned: false,
  },
];

export const CREDENTIALS = [
  {
    title: "Soil health and testing (Topic certificate)",
    issuer: "Veza Interactive",
    issued: "2026-11-02",
    kind: "Completion",
  },
];

export const LEARNER_STATS = { xp: 340, level: 3, nextLevelXp: 500, streakDays: 4 };

/** Notice board items (sample; real notices arrive with messaging in M5/M6). */
export const NOTICES = [
  {
    id: "n-1",
    title: "Veza expo near you",
    body: "Try all five worlds at the Polokwane schools expo on 21 November. Bring a friend.",
  },
  {
    id: "n-2",
    title: "New bursary match",
    body: "Ubuntu Skies Aviation Trust opened its Grade 10-12 bursary. You match 82 out of 100.",
  },
  {
    id: "n-3",
    title: "Badge unlocked: First topic",
    body: "You finished Soil health and testing. Learn 3 more days for your 7-day streak.",
  },
];

/** Calendar items (sample; real dates come from enrolments, expos and matches in M3-M5). */
export const EVENTS = [
  { id: "e-1", date: "2026-11-12", title: "Finish Crop planning (AGR-101)", world: "AGR" },
  { id: "e-2", date: "2026-11-18", title: "Live Q&A: what pilots study", world: "AVI" },
  { id: "e-3", date: "2026-11-21", title: "Veza expo, Polokwane schools", world: "AGR" },
  { id: "e-4", date: "2026-11-21", title: "Try the Medical world at the expo", world: "MED" },
  { id: "e-5", date: "2026-11-27", title: "Clinic job shadow info session", world: "MED" },
  { id: "e-6", date: "2026-12-05", title: "Bursary application workshop (online)", world: "AVI" },
  { id: "e-7", date: "2026-12-10", title: "Power tools topic 1 due (ENG-101)", world: "ENG" },
] as const;
