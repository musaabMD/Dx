export type Exam = {
  slug: string;
  name: string;
  shortName: string;
  iconLabel: string; // 1-2 char abbreviation shown inside the gradient tile
  category: string;
  baseMembers: number;
  description: string;
  accent: string;
};

export const EXAMS: Exam[] = [
  {
    slug: "usmle-step-1",
    name: "USMLE Step 1",
    shortName: "Step 1",
    iconLabel: "S1",
    category: "Medical",
    baseMembers: 412_300,
    description: "First Aid, Sketchy, Pathoma — let's grind.",
    accent: "from-rose-500 to-orange-500",
  },
  {
    slug: "usmle-step-2-ck",
    name: "USMLE Step 2 CK",
    shortName: "Step 2 CK",
    iconLabel: "S2",
    category: "Medical",
    baseMembers: 333_482,
    description: "UWorld, Amboss, NBMEs. Score predictors welcome.",
    accent: "from-purple-500 to-fuchsia-500",
  },
  {
    slug: "usmle-step-3",
    name: "USMLE Step 3",
    shortName: "Step 3",
    iconLabel: "S3",
    category: "Medical",
    baseMembers: 87_120,
    description: "CCS cases, Biostats, Foundations of Independent Practice.",
    accent: "from-cyan-500 to-sky-500",
  },
  {
    slug: "mcat",
    name: "MCAT",
    shortName: "MCAT",
    iconLabel: "MC",
    category: "Pre-Med",
    baseMembers: 198_540,
    description: "CARS strategies, AAMC FLs, content review.",
    accent: "from-emerald-500 to-teal-500",
  },
  {
    slug: "nclex-rn",
    name: "NCLEX-RN",
    shortName: "NCLEX",
    iconLabel: "NC",
    category: "Nursing",
    baseMembers: 156_220,
    description: "SATA, priority questions, UWorld nursing.",
    accent: "from-pink-500 to-rose-500",
  },
  {
    slug: "comlex-level-2",
    name: "COMLEX Level 2",
    shortName: "COMLEX 2",
    iconLabel: "C2",
    category: "Medical",
    baseMembers: 41_870,
    description: "OMM, COMBANK, COMQUEST.",
    accent: "from-amber-500 to-yellow-500",
  },
  {
    slug: "lsat",
    name: "LSAT",
    shortName: "LSAT",
    iconLabel: "LS",
    category: "Law",
    baseMembers: 142_900,
    description: "Logic games, RC, LR drills.",
    accent: "from-indigo-500 to-blue-500",
  },
  {
    slug: "bar-exam",
    name: "Bar Exam",
    shortName: "Bar",
    iconLabel: "BR",
    category: "Law",
    baseMembers: 78_310,
    description: "MBE, MEE, MPT — Themis vs. Barbri.",
    accent: "from-slate-500 to-zinc-600",
  },
  {
    slug: "gre",
    name: "GRE",
    shortName: "GRE",
    iconLabel: "GR",
    category: "Grad",
    baseMembers: 211_460,
    description: "Quant, Verbal, AWA.",
    accent: "from-green-500 to-lime-500",
  },
  {
    slug: "gmat",
    name: "GMAT",
    shortName: "GMAT",
    iconLabel: "GM",
    category: "Grad",
    baseMembers: 124_780,
    description: "Focus Edition, OG questions, target 705+.",
    accent: "from-blue-500 to-indigo-500",
  },
  {
    slug: "cfa-level-1",
    name: "CFA Level 1",
    shortName: "CFA L1",
    iconLabel: "C1",
    category: "Finance",
    baseMembers: 97_540,
    description: "Ethics, FRA, Quant — six hours of pain.",
    accent: "from-yellow-500 to-amber-600",
  },
  {
    slug: "cpa-exam",
    name: "CPA Exam",
    shortName: "CPA",
    iconLabel: "CP",
    category: "Finance",
    baseMembers: 64_220,
    description: "FAR, REG, AUD, BEC. Becker squad assemble.",
    accent: "from-orange-500 to-red-500",
  },
];

export function getExam(slug: string): Exam | undefined {
  return EXAMS.find((e) => e.slug === slug);
}
