"use client";

import {
  PricingTable,
  useClerk,
  useUser,
} from "@clerk/nextjs";
import { useConvex, useMutation, useQuery } from "convex/react";
import {
  ArrowRight,
  BarChart3,
  Bookmark,
  BookOpen,
  Bot,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Clock,
  Circle,
  Crown,
  Copy,
  FileText,
  Flag,
  Flame,
  History,
  Infinity as InfinityIcon,
  Info,
  House,
  KeyRound,
  Library,
  List,
  Lock,
  Menu,
  MessageCircle,
  Maximize2,
  Minimize2,
  RotateCcw,
  Scale,
  Search,
  Send,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  Star,
  Tags,
  Target,
  Timer,
  Trophy,
  User,
  X,
  XCircle,
  Zap,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import type { CSSProperties, FormEvent, MouseEvent } from "react";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import {
  Exam,
  exams,
  hubLinks,
  question,
} from "@/lib/data";
import type { HubLink } from "@/lib/data";
import type {
  DrNoteScreen,
  DrNoteTab,
} from "@/lib/routes";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  routeForHomeTab,
  routeForScreen,
  routeStateFromPath,
} from "@/lib/routes";
import Link from "next/link";
import { useRouter } from "next/navigation";

/* ── types ────────────────────────────────────────── */
type Screen = DrNoteScreen;
type Tab = DrNoteTab;
type Plan = "free" | "monthly" | "quarterly" | "yearly";
type BillingPlan = Exclude<Plan, "free">;
type SetupKind = "subjects" | "tags" | "review" | "session";
type ReviewFilter = "all" | "flagged" | "incorrect" | "correct";
type QuestionStatus = "unused" | "used" | "incorrect" | "flagged";
type TagPoolStatusCount = {
  tag: string;
  total: number;
  unused: number;
  used: number;
  incorrect: number;
  flagged: number;
};
type QuizMode = "practice" | "mock";
type ContentComment = {
  id: string;
  text: string;
  createdAt: string;
};
type DashboardStats = {
  subjectCount: number;
  tagCount: number;
  readyMocks: number;
  reviewCount: number;
  flaggedCount: number;
  incorrectCount: number;
  correctCount: number;
  accuracy: number;
  activeSessions: number;
  notesCount: number;
  libraryCount: number;
  aiAskCount: number;
  questionsAnswered: number;
  streak: number;
  rank: number | null;
  estimatedScore: number;
};
type LeaderboardRow = {
  userId: string;
  name: string;
  xp: number;
  rank: number;
  isCurrentUser: boolean;
};
type TopicMasteryRow = {
  topic: string;
  mastery: number;
  answered: number;
  total: number;
};
type QuizSummary = {
  answered?: number;
  unanswered?: number;
  flagged?: number;
  minutes?: number;
  subjectBreakdown?: SubjectPerformance[];
  reviewItems?: ReportReviewItem[];
};
type SubjectPerformance = {
  name: string;
  correct: number;
  incorrect: number;
  unanswered: number;
  flagged: number;
  total: number;
};
type ReportReviewItem = {
  number: number;
  subject: string;
  status: "incorrect" | "flagged" | "unanswered";
  stem: string;
};
type ReportState = {
  title: string;
  source: string;
  score: number;
  correct: number;
  total: number;
  minutes: number;
  mode: QuizMode;
  answered?: number;
  unanswered?: number;
  flagged?: number;
  subjectBreakdown?: SubjectPerformance[];
  reviewItems?: ReportReviewItem[];
};
type StudyHeaderAccent = "green" | "blue" | "teal" | "orange" | "purple" | "red" | "yellow";
type StudyHeaderMeta = {
  page: string;
  description: string;
  icon: typeof BookOpen;
  accent: StudyHeaderAccent;
};

const DAILY_LIMIT = 15;
const COMMENT_STORAGE_KEY = "drnote-content-comments-v1";
const INVITE_QUERY_KEY = "invite";
const INVITE_STORAGE_KEY = "drnote_invite_code";
const INVITE_TRIAL_DAYS = 3;
const DAY_MS = 24 * 60 * 60 * 1000;
const USAGE_WINDOW_DAY_PATTERN = /^\d+$/;
const INTERNAL_HISTORY_KEY = "drnote-internal-history-depth";

type NavigationHistoryEntryLike = {
  index: number;
  url: string | null;
};

type WindowWithNavigation = Window & {
  navigation?: {
    currentEntry?: NavigationHistoryEntryLike;
    entries?: () => NavigationHistoryEntryLike[];
  };
};

function getUsageResetTime(day?: string | null) {
  if (!day || !USAGE_WINDOW_DAY_PATTERN.test(day)) return null;
  const startMs = Number.parseInt(day, 10);
  if (!Number.isFinite(startMs) || startMs < 0) return null;
  return (startMs + 1) * DAY_MS;
}

function hasPreviousSameOriginHistoryEntry() {
  if (typeof window === "undefined") return false;
  const navigation = (window as WindowWithNavigation).navigation;
  const currentIndex = navigation?.currentEntry?.index;
  const entries = navigation?.entries?.();
  if (typeof currentIndex !== "number" || !entries) return false;
  const previousEntry = entries.find((entry) => entry.index === currentIndex - 1);
  if (!previousEntry?.url) return false;
  try {
    return new URL(previousEntry.url).origin === window.location.origin;
  } catch {
    return false;
  }
}
const EMPTY_DASHBOARD_STATS: DashboardStats = {
  subjectCount: 0,
  tagCount: 0,
  readyMocks: 0,
  reviewCount: 0,
  flaggedCount: 0,
  incorrectCount: 0,
  correctCount: 0,
  accuracy: 0,
  activeSessions: 0,
  notesCount: 0,
  libraryCount: 0,
  aiAskCount: 0,
  questionsAnswered: 0,
  streak: 0,
  rank: null,
  estimatedScore: 0,
};

const PLANS = [
  { id: "monthly" as BillingPlan, name: "Monthly", price: "$20", cadence: "/mo", detail: "Pay month to month.", save: null, badge: null },
  { id: "quarterly" as BillingPlan, name: "3 months", price: "$50", cadence: "/3 mo", detail: "Flexible prep sprint.", save: "Save 17%", badge: null },
  { id: "yearly" as BillingPlan, name: "Yearly", price: "$120", cadence: "/yr", detail: "Best for dedicated prep.", save: "Save 50%", badge: "Best value" },
];

const FEATURES = [
  "Unlimited practice questions",
  "Full-length timed mock exams",
  "Detailed performance analysis",
  "Mistake review with explanations",
  "AI tutor with saved history",
  "No ads, ever",
];

const EXAM_CATEGORIES_FALLBACK = ["All", "Medical", "Law", "Finance", "Science", "Academic"] as const;
const EXAM_PAGE_SIZE = 36;

const PRICING_COMPARISON = [
  { feature: "Free", free: `${DAILY_LIMIT} questions/day`, pro: "No Ask AI" },
  { feature: "Pro", free: "Unlimited questions", pro: "Ask AI + mocks" },
];

const TAG_BANK = [
  "acute coronary syndrome", "adrenal recall 1 month", "arrhythmia ECG", "asthma step therapy",
  "biostatistics", "cardiology weak", "diabetes emergency", "electrolytes", "ethics",
  "high-yield images", "hypertension", "infectious disease", "neurology stroke",
  "renal recall 2 weeks", "respiratory physiology", "sepsis", "shock", "vaccines",
  "wrong twice", "flagged before mock", "rapid review", "pharmacology",
  "pediatrics", "OB/GYN", "psychiatry", "surgery recall 1 month",
];

const SESSION_BANK = [
  { name: "Cardiology timed block", source: "Subjects", status: "Resume", score: "In progress", questions: 18, date: "Jun 8, 2026" },
  { name: "Renal recall 2 weeks", source: "Tags", status: "Report", score: "76%", questions: 20, date: "Jun 6, 2026" },
  { name: "Flagged review", source: "Review", status: "Restart", score: "68%", questions: 12, date: "Jun 4, 2026" },
  { name: "MRCP mock 1", source: "Mock Exam", status: "Report", score: "72%", questions: 120, date: "Jun 1, 2026" },
];

type MockQuestion = {
  id: number;
  topic: string;
  stem: string;
  choices: string[];
  answer: string;
};

const CHOICE_LABELS = ["A", "B", "C", "D"];

type PracticeQuestion = {
  questionId?: Id<"questions">;
  topic: string;
  subtopic: string;
  comments: number;
  prompt: string;
  options: { id: string; label: string }[];
  correct: string;
  explanation: string;
  why: Record<string, string>;
  objective: string;
};

const PRACTICE_QUESTIONS: PracticeQuestion[] = [
  {
    topic: "Endocrine pathology",
    subtopic: "Cardiology",
    comments: 1,
    prompt:
      "A 27-year-old medical student develops episodic palpitations, sweating, and headaches. Blood pressure is 172/102 mmHg during attacks. Which biochemical finding is most likely elevated?",
    options: [
      { id: "A", label: "Urinary metanephrines" },
      { id: "B", label: "Serum cortisol after dexamethasone" },
      { id: "C", label: "Plasma renin activity" },
      { id: "D", label: "Thyroid-stimulating hormone" },
    ],
    correct: "A",
    explanation:
      "The triad of paroxysmal hypertension with palpitations, diaphoresis, and headache is the classic presentation of a catecholamine-secreting pheochromocytoma. These tumors release epinephrine and norepinephrine, which are metabolized to metanephrines. Plasma free metanephrines and 24-hour urinary fractionated metanephrines are the most sensitive screening tests.",
    why: {
      B: "Cortisol after dexamethasone screens for Cushing syndrome, which causes sustained, not episodic, hypertension.",
      C: "Elevated renin points to renovascular disease or secondary aldosteronism, not the episodic catecholamine surges seen here.",
      D: "TSH evaluates thyroid function; hyperthyroidism rarely causes this degree of paroxysmal hypertension.",
    },
    objective:
      "Pheochromocytoma classically presents with episodic hypertension, headache, palpitations, and sweating. Screen with plasma free or 24-hour urinary metanephrines.",
  },
  {
    topic: "Endocrine pathology",
    subtopic: "Nephrology",
    comments: 3,
    prompt:
      "A 48-year-old woman has resistant hypertension and persistent, unprovoked hypokalemia. Plasma renin activity is low and plasma aldosterone is high. What is the most likely diagnosis?",
    options: [
      { id: "A", label: "Primary hyperaldosteronism" },
      { id: "B", label: "Renal artery stenosis" },
      { id: "C", label: "Pheochromocytoma" },
      { id: "D", label: "Cushing syndrome" },
    ],
    correct: "A",
    explanation:
      "Hypertension with spontaneous hypokalemia, a high aldosterone level, and suppressed renin is the hallmark of primary hyperaldosteronism, most often from an adrenal adenoma or bilateral hyperplasia. Autonomous aldosterone drives sodium retention and potassium wasting.",
    why: {
      B: "Renal artery stenosis raises both renin and aldosterone; here renin is low.",
      C: "Pheochromocytoma causes episodic catecholamine-driven hypertension, not high aldosterone with low renin.",
      D: "Cushing syndrome features cortisol excess and Cushingoid signs rather than an isolated high aldosterone-to-renin ratio.",
    },
    objective:
      "Suspect primary hyperaldosteronism in resistant hypertension with hypokalemia; confirm with an elevated aldosterone-to-renin ratio.",
  },
  {
    topic: "Endocrine pathology",
    subtopic: "Thyroid",
    comments: 0,
    prompt:
      "A 30-year-old woman reports weight loss, heat intolerance, palpitations, and tremor. She has a diffuse goiter and exophthalmos. Which is the best initial test?",
    options: [
      { id: "A", label: "Serum TSH" },
      { id: "B", label: "Free T4 alone" },
      { id: "C", label: "Thyroid ultrasound" },
      { id: "D", label: "Radioactive iodine uptake scan" },
    ],
    correct: "A",
    explanation:
      "The picture is hyperthyroidism, likely Graves disease given the goiter and exophthalmos. Serum TSH is the most sensitive initial screen because the pituitary responds to small changes in thyroid hormone.",
    why: {
      B: "Free T4 confirms and grades hyperthyroidism, but TSH is the more sensitive first step.",
      C: "Ultrasound assesses nodules and structure, not functional status.",
      D: "Radioactive iodine uptake helps determine the cause of thyrotoxicosis after labs confirm it, not as the first test.",
    },
    objective:
      "TSH is the most sensitive initial screening test for suspected thyroid dysfunction.",
  },
];

const REPORT_REASONS = [
  "Incorrect answer or explanation",
  "Typo or grammar issue",
  "Question is unclear",
  "Duplicate question",
  "Other",
];

const MOCK_QUESTION_BANK: MockQuestion[] = [
  {
    id: 1,
    topic: question.topic,
    stem: question.stem,
    choices: question.choices,
    answer: question.answer,
  },
  {
    id: 2,
    topic: "Respiratory medicine",
    stem: "A 64-year-old smoker presents with progressive dyspnea and a barrel-shaped chest. Spirometry shows reduced FEV1/FVC. Which intervention most clearly improves survival?",
    choices: ["Inhaled salbutamol", "Long-term oxygen for severe resting hypoxemia", "Oral theophylline", "Prophylactic antibiotics"],
    answer: "Long-term oxygen for severe resting hypoxemia",
  },
  {
    id: 3,
    topic: "Cardiology",
    stem: "A patient with crushing chest pain has ST elevation in leads II, III, and aVF. Which coronary artery is most commonly involved?",
    choices: ["Left anterior descending artery", "Right coronary artery", "Left circumflex artery", "Left main coronary artery"],
    answer: "Right coronary artery",
  },
  {
    id: 4,
    topic: "Renal physiology",
    stem: "A patient has muscle weakness, peaked T waves, and a potassium of 6.8 mmol/L. What is the immediate treatment to stabilize the myocardium?",
    choices: ["Insulin with dextrose", "Calcium gluconate", "Nebulized salbutamol", "Sodium polystyrene sulfonate"],
    answer: "Calcium gluconate",
  },
  {
    id: 5,
    topic: "Neurology",
    stem: "A 72-year-old develops sudden right arm weakness and expressive aphasia. Noncontrast CT shows no hemorrhage. What is the most important next step if within the treatment window?",
    choices: ["Aspirin only", "IV thrombolysis assessment", "Lumbar puncture", "Immediate carotid endarterectomy"],
    answer: "IV thrombolysis assessment",
  },
  {
    id: 6,
    topic: "Infectious disease",
    stem: "A febrile patient with neck stiffness and photophobia is suspected of having bacterial meningitis. Which action should not be delayed if lumbar puncture is postponed?",
    choices: ["Start empiric antibiotics", "Wait for CSF microscopy", "Order outpatient review", "Give oral antivirals only"],
    answer: "Start empiric antibiotics",
  },
  {
    id: 7,
    topic: "Pharmacology",
    stem: "A patient taking warfarin starts trimethoprim-sulfamethoxazole and later develops an elevated INR. What best explains this interaction?",
    choices: ["Reduced vitamin K absorption only", "CYP inhibition increasing warfarin effect", "Increased renal excretion of warfarin", "Direct platelet receptor blockade"],
    answer: "CYP inhibition increasing warfarin effect",
  },
  {
    id: 8,
    topic: "Endocrinology",
    stem: "A young woman has weight loss, tremor, heat intolerance, and diffuse goiter. Which laboratory pattern is most consistent with Graves disease?",
    choices: ["High TSH, low free T4", "Low TSH, high free T4", "High TSH, high free T4", "Normal TSH, low free T4"],
    answer: "Low TSH, high free T4",
  },
];

const NOTE_BANK = [
  {
    title: "ECG: narrow complex tachycardia",
    kind: "Bite size HY",
    category: "Cardiology",
    deck: "Arrhythmia deck",
    text: "Stable SVT: vagal maneuvers, then adenosine. Unstable rhythm gets synchronized cardioversion.",
    detailBefore: "Regular narrow-complex tachycardia is most often SVT when the QRS is under 120 ms and P waves are not clearly visible. ",
    highlight: "Stable patients get vagal maneuvers first, then adenosine if the rhythm remains regular.",
    detailAfter: " If the patient is hypotensive, altered, ischemic, or in shock, move straight to synchronized cardioversion.",
    tags: ["SVT", "adenosine", "ECG"],
    review: "Recall tomorrow",
    saved: "Saved today",
    image: false,
  },
  {
    title: "Adrenal crisis triggers",
    kind: "HY note",
    category: "Endocrine",
    deck: "Shock deck",
    text: "Hypotension, abdominal pain, hyponatremia, hyperkalemia. Treat first with IV hydrocortisone and fluids.",
    detailBefore: "Think adrenal crisis in a sick patient with unexplained hypotension, vomiting, abdominal pain, fever, or collapse. ",
    highlight: "Do not wait for cortisol results before giving IV hydrocortisone and isotonic fluids.",
    detailAfter: " Hyponatremia and hyperkalemia support primary adrenal insufficiency, especially after infection, surgery, or steroid withdrawal.",
    tags: ["shock", "steroids", "electrolytes"],
    review: "Due in 3 days",
    saved: "Saved today",
    image: true,
  },
  {
    title: "Pneumonia severity",
    kind: "Bite size HY",
    category: "Respiratory",
    deck: "Infections deck",
    text: "Use CURB-65 for admission risk. Confusion and low blood pressure push toward inpatient care.",
    detailBefore: "CURB-65 estimates mortality risk in community-acquired pneumonia using confusion, urea, respiratory rate, blood pressure, and age 65 or older. ",
    highlight: "Confusion, hypotension, tachypnea, elevated urea, or age over 65 should lower the threshold for admission.",
    detailAfter: " Always combine the score with oxygenation, comorbidities, social support, and clinical appearance.",
    tags: ["CURB-65", "CAP", "admission"],
    review: "Recall next week",
    saved: "Saved today",
    image: false,
  },
  {
    title: "Hyperkalemia ECG sequence",
    kind: "Image note",
    category: "Renal",
    deck: "Electrolytes deck",
    text: "Peaked T waves progress to PR prolongation, QRS widening, sine wave, then arrest. Calcium stabilizes first.",
    detailBefore: "Severe hyperkalemia can deteriorate quickly, especially with renal failure or potassium-shifting medications. ",
    highlight: "ECG changes or potassium above 6.5 with symptoms means calcium gluconate comes before shifting potassium.",
    detailAfter: " Then use insulin with dextrose, nebulized salbutamol, and definitive potassium removal when needed.",
    tags: ["K+", "ECG", "calcium"],
    review: "Due today",
    saved: "Saved yesterday",
    image: true,
  },
];

type LibraryItem = {
  title: string;
  type: string;
  saved: string;
  summary: string;
  sections: Array<{
    heading: string;
    body: string;
  }>;
  tags: string[];
};

const LIBRARY_ITEMS: LibraryItem[] = [
  {
    title: "Heart failure treatment ladder",
    type: "Table",
    saved: "Today",
    summary: "A stepwise review of chronic heart failure therapy, escalation triggers, and high-yield contraindications.",
    sections: [
      {
        heading: "Core sequence",
        body: "Start with guideline-directed therapy: ARNI or ACE inhibitor, evidence beta blocker, mineralocorticoid receptor antagonist, and SGLT2 inhibitor when tolerated.",
      },
      {
        heading: "When symptoms persist",
        body: "Add loop diuretics for congestion. Consider hydralazine-nitrate, ivabradine, device therapy, or specialist review based on rhythm, QRS duration, and ejection fraction.",
      },
      {
        heading: "Exam trap",
        body: "Do not start or increase beta blockers during acute decompensation. Stabilize volume status first, then optimize chronic therapy.",
      },
    ],
    tags: ["Cardiology", "Treatment", "High yield"],
  },
  {
    title: "Respiratory acid-base map",
    type: "Diagram",
    saved: "Yesterday",
    summary: "Pattern recognition for respiratory acidosis and alkalosis with compensation clues and common clinical causes.",
    sections: [
      {
        heading: "First split",
        body: "Low pH with high CO2 suggests respiratory acidosis. High pH with low CO2 suggests respiratory alkalosis.",
      },
      {
        heading: "Compensation clue",
        body: "Renal bicarbonate changes are larger in chronic disease than acute disease, so a high bicarbonate supports chronic CO2 retention.",
      },
      {
        heading: "Common causes",
        body: "COPD, sedatives, neuromuscular weakness, and airway obstruction cause retention. Anxiety, hypoxemia, sepsis, and pregnancy can drive alkalosis.",
      },
    ],
    tags: ["Respiratory", "Physiology", "Diagram"],
  },
  {
    title: "Antibiotic renal dosing",
    type: "Reference",
    saved: "3 days ago",
    summary: "A renal adjustment checklist for common antibiotic classes and monitoring points before exam questions or ward prescribing.",
    sections: [
      {
        heading: "Adjust carefully",
        body: "Aminoglycosides, vancomycin, many beta-lactams, fluoroquinolones, and trimethoprim-sulfamethoxazole often need renal adjustment.",
      },
      {
        heading: "Monitor",
        body: "Follow creatinine trend, urine output, drug levels when indicated, and toxicity signs such as ototoxicity, nephrotoxicity, or QT prolongation.",
      },
      {
        heading: "Exam trap",
        body: "Renal impairment changes both dosing interval and toxicity risk. Avoid assuming normal dosing in older patients with low muscle mass.",
      },
    ],
    tags: ["Renal", "Infectious disease", "Reference"],
  },
];

const REVIEW_QUESTION_BANK: Array<{
  id: number;
  status: Exclude<ReviewFilter, "all">;
  topic: string;
  stem: string;
  note: string;
}> = [
  { id: 1, status: "incorrect", topic: "Endocrine", stem: "Paroxysmal hypertension with palpitations, sweating, and headache", note: "Pheochromocytoma screen" },
  { id: 2, status: "flagged", topic: "Cardiology", stem: "Inferior ST elevation and the most likely culprit artery", note: "ECG localization" },
  { id: 3, status: "correct", topic: "Respiratory", stem: "COPD intervention that improves survival in severe resting hypoxemia", note: "Long-term oxygen" },
  { id: 4, status: "incorrect", topic: "Renal", stem: "Immediate membrane stabilization for severe hyperkalemia", note: "Calcium first" },
  { id: 5, status: "flagged", topic: "Neurology", stem: "Acute aphasia and arm weakness within thrombolysis window", note: "Stroke pathway" },
  { id: 6, status: "correct", topic: "Infectious Disease", stem: "Meningitis treatment step when lumbar puncture is delayed", note: "Do not delay antibiotics" },
  { id: 7, status: "incorrect", topic: "Pharmacology", stem: "Warfarin interaction after trimethoprim-sulfamethoxazole", note: "CYP inhibition" },
  { id: 8, status: "correct", topic: "Endocrine", stem: "Laboratory pattern most consistent with Graves disease", note: "Low TSH, high T4" },
];

const REVIEW_TOTAL_QUESTIONS = 418;

const REVIEW_TABS: Array<{ value: ReviewFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "flagged", label: "Flagged" },
  { value: "incorrect", label: "Incorrect" },
  { value: "correct", label: "Correct" },
];

const REVIEW_STATUS_META: Record<Exclude<ReviewFilter, "all">, {
  label: string;
  Icon: typeof Check;
}> = {
  correct: { label: "Correct", Icon: Check },
  incorrect: { label: "Incorrect", Icon: X },
  flagged: { label: "Flagged", Icon: Flag },
};

function masteryColor(progress: number) {
  if (progress < 60) return { fill: "var(--red)", badge: "badge-red" };
  if (progress < 85) return { fill: "var(--yellow)", badge: "badge-yellow" };
  return { fill: "var(--green)", badge: "badge-green" };
}

function examById(examId?: string) {
  return exams.find(exam => exam.id === examId) ?? exams[0];
}

function reportSubject(topic: string) {
  const t = topic.toLowerCase();
  if (t.includes("cardio")) return "Cardiology";
  if (t.includes("respir")) return "Respiratory";
  if (t.includes("renal")) return "Renal";
  if (t.includes("neuro")) return "Neurology";
  if (t.includes("infect")) return "Infectious Disease";
  if (t.includes("pharm")) return "Pharmacology";
  if (t.includes("endo") || t.includes("adrenal")) return "Endocrine";
  return topic;
}

function gapLevel(progress: number) {
  if (progress < 50) return "low";
  if (progress < 65) return "mid";
  return "high";
}

function hubCountFor(linkId: string, stats: DashboardStats) {
  const countMap: Record<string, string> = {
    subjects: `${stats.subjectCount} lists`,
    tags: `${stats.tagCount} tags`,
    mock: `${stats.readyMocks} ready`,
    review: `${stats.reviewCount} saved`,
    analysis: `${stats.accuracy}%`,
    sessions: `${stats.activeSessions} active`,
    notes: `${stats.notesCount} notes`,
    library: `${stats.libraryCount} items`,
    ask: `${stats.aiAskCount} asks`,
  };
  return countMap[linkId] ?? "0";
}

function formatStoredDate(timestamp?: number) {
  if (!timestamp) return "Saved";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(timestamp));
}

function userInitial(name?: string | null, email?: string | null) {
  const source = name?.trim() || email?.trim() || "Student";
  return source.charAt(0).toUpperCase();
}

function getGreetingByTime(now: Date = new Date()) {
  const hour = now.getHours();
  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good night";
}

function buildAskWelcomeMessage(userName: string, examTitle: string) {
  return `Good morning, ${userName}. Ask DrNote · ${examTitle} tutor.`;
}

function convexQuestionToPracticeQuestion(questionDoc: {
  _id: Id<"questions">;
  subject: string;
  topic: string;
  subtopic?: string;
  options: { id: string; label: string }[];
  correctOptionId: string;
  prompt: string;
  explanation: string;
  objective: string;
}): PracticeQuestion {
  const why = Object.fromEntries(
    questionDoc.options
      .filter(option => option.id !== questionDoc.correctOptionId)
      .map(option => [
        option.id,
        `Review why ${option.label} does not best fit the stem before moving on.`,
      ])
  );
  return {
    questionId: questionDoc._id,
    topic: questionDoc.topic,
    subtopic: questionDoc.subtopic ?? questionDoc.subject,
    comments: 0,
    prompt: questionDoc.prompt,
    options: questionDoc.options,
    correct: questionDoc.correctOptionId,
    explanation: questionDoc.explanation,
    why,
    objective: questionDoc.objective,
  };
}

function fallbackReport(exam: Exam): ReportState {
  return {
    title: `${exam.title} Mock Exam`,
    source: "Realistic exam mode",
    score: 76,
    correct: 15,
    total: 20,
    minutes: 24,
    mode: "mock",
    answered: 20,
    unanswered: 0,
    flagged: 3,
    subjectBreakdown: [
      { name: "Cardiology", correct: 4, incorrect: 1, unanswered: 0, flagged: 1, total: 5 },
      { name: "Respiratory", correct: 3, incorrect: 1, unanswered: 0, flagged: 0, total: 4 },
      { name: "Renal", correct: 2, incorrect: 2, unanswered: 0, flagged: 1, total: 4 },
      { name: "Endocrine", correct: 3, incorrect: 1, unanswered: 0, flagged: 1, total: 4 },
      { name: "Neurology", correct: 2, incorrect: 1, unanswered: 0, flagged: 0, total: 3 },
    ],
    reviewItems: [
      { number: 4, subject: "Renal", status: "incorrect", stem: "Immediate membrane stabilization for severe hyperkalemia" },
      { number: 7, subject: "Pharmacology", status: "flagged", stem: "Warfarin interaction after trimethoprim-sulfamethoxazole" },
      { number: 12, subject: "Endocrine", status: "incorrect", stem: "Laboratory pattern most consistent with Graves disease" },
    ],
  };
}

function commentKeyForQuestion(examId: string, index: number, stem: string) {
  return `${examId}:practice:${index + 1}:${stem}`;
}

function seedComments(examId: string): Record<string, ContentComment[]> {
  void examId;
  return {};
}

function studyHeaderMeta(screen: Screen, exam: Exam, report: ReportState | null): StudyHeaderMeta | null {
  switch (screen) {
    case "exam":
      return {
        page: exam.title,
        description: "Choose a study mode, review tool, or mock exam.",
        icon: BookOpen,
        accent: "green",
      };
    case "subjects":
      return {
        page: "Subjects",
        description: "Pick a system or specialty, then choose count, timer, and question status before starting.",
        icon: BookOpen,
        accent: "blue",
      };
    case "tags":
      return {
        page: "Tags",
        description: "Search a large tag library for topics, recall dates, weak areas, and custom labels.",
        icon: Target,
        accent: "teal",
      };
    case "review":
      return {
        page: "Review",
        description: "Choose all, flagged, incorrect, or correct questions. Starting opens the same setup options.",
        icon: History,
        accent: "orange",
      };
    case "analysis":
      return {
        page: "Analysis",
        description: "Full performance view across accuracy, pacing, streak, tags, and topic gaps.",
        icon: BarChart3,
        accent: "purple",
      };
    case "sessions":
      return {
        page: "Sessions",
        description: "All subject, tag, review, and mock sessions. Resume, restart, or open detailed reports.",
        icon: CalendarDays,
        accent: "red",
      };
    case "notes":
      return {
        page: "My Notes",
        description: "High-yield notes and bite-size reminders. Notes can include images or stay text-only.",
        icon: FileText,
        accent: "yellow",
      };
    case "library":
      return {
        page: "Library",
        description: "Saved explanations, tables, diagrams, and references for quick review.",
        icon: Library,
        accent: "teal",
      };
    case "ask":
      return {
        page: "Ask DrNote",
        description: `${exam.title} tutor with saved explanations, review plans, and answer-choice breakdowns.`,
        icon: MessageCircle,
        accent: "purple",
      };
    case "mock":
      return {
        page: "Mock Exam",
        description: `${exam.title} full self-assessment with timer and automated score.`,
        icon: ClipboardCheck,
        accent: "blue",
      };
    case "report":
      return {
        page: "Report",
        description: report ? `${report.title} · ${report.source}` : "Score, pacing, weak areas, and review queue.",
        icon: BarChart3,
        accent: "purple",
      };
    default:
      return null;
  }
}

/* ── App root ─────────────────────────────────────── */
export default function DrNoteApp({
  initialScreen = "home",
  initialTab = "learn",
  initialExamId,
}: {
  initialScreen?: Screen;
  initialTab?: Tab;
  initialExamId?: string;
}) {
  const initialExam = useMemo(() => examById(initialExamId), [initialExamId]);
  const { isLoaded, isSignedIn, user } = useUser();
  const { openSignIn, openSignUp } = useClerk();
  const convexUser = useQuery(api.users.current, isSignedIn ? {} : "skip");
  const usageToday = useQuery(api.usage.today, isSignedIn ? {} : "skip");
  const planLimits = useQuery(api.limits.forCurrentUser, isSignedIn ? {} : "skip");
  const syncCurrentUser = useMutation(api.users.syncCurrentUser);
  const consumeQuestionRemote = useMutation(api.usage.consumeQuestion);
  const createExamAiThread = useMutation(api.ai.getOrCreateThread);
  const addAiMessage = useMutation(api.ai.addMessage);
  const startMockSession = useMutation(api.practice.startSession);
  const convexClient = useConvex();
  const [remoteExamCategories, setRemoteExamCategories] = useState<string[] | null>(null);
  const [screen, setScreen] = useState<Screen>(initialScreen);
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [selectedExam, setSelectedExam] = useState<Exam>(initialExam);
  const dashboardStats = useQuery(api.dashboard.overview, { examId: selectedExam.id });
  const topicMastery = useQuery(api.dashboard.topicMastery, { examId: selectedExam.id });
  const leaderboardRows = useQuery(api.dashboard.leaderboard, isSignedIn ? { windowDays: 7 } : "skip");
  const sessions = useQuery(api.practice.mySessions, isSignedIn ? { examId: selectedExam.id, limit: 20 } : "skip");
  const reviewRows = useQuery(api.reviews.mine, isSignedIn ? { examId: selectedExam.id, limit: 100 } : "skip");
  const notes = useQuery(api.learning.notes, { examId: selectedExam.id });
  const libraryItems = useQuery(api.learning.library, { examId: selectedExam.id });
  const questionBank = useQuery(api.questions.list, { examId: selectedExam.id, limit: 100 });
  const tagStatusCounts = useQuery(api.questions.tagStatusCounts, { examId: selectedExam.id });
  const examCategories = useMemo(() => {
    if (remoteExamCategories && remoteExamCategories.length > 0) {
      const normalized = remoteExamCategories
        .map((name) => String(name).trim())
        .filter((name) => name.length > 0);
      return Array.from(new Set(normalized));
    }
    return EXAM_CATEGORIES_FALLBACK.slice(1);
  }, [remoteExamCategories]);
  useEffect(() => {
    let mounted = true;
    if (!convexClient) return;

    const fetchCategoryRows = async () => {
      try {
        const rows = await convexClient.query(api.seed.examCategories, {});
        if (!mounted) return;
        if (Array.isArray(rows)) {
          setRemoteExamCategories(rows.map((name) => String(name).trim()).filter((name) => name.length > 0));
        } else {
          setRemoteExamCategories([]);
        }
      } catch {
        if (mounted) {
          setRemoteExamCategories([]);
        }
      }
    };

    void fetchCategoryRows();
    return () => {
      mounted = false;
    };
  }, [convexClient]);
  const categoryOptions = useMemo(() => {
    const source = ["All", ...examCategories];
    return Array.from(new Set(source.filter(Boolean)));
  }, [examCategories]);
  const [plan, setPlan] = useState<Plan>("free");
  const [billingPlan, setBillingPlan] = useState<BillingPlan>("yearly");
  const [usedQuestions, setUsedQuestions] = useState(0);
  const [usageBuffer, setUsageBuffer] = useState(0);
  const [inviteCode, setInviteCode] = useState<string | null>(null);

  const [showPricing, setShowPricing] = useState(false);
  const [showLimit, setShowLimit] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [setupKind, setSetupKind] = useState<SetupKind>("subjects");
  const [setupTitle, setSetupTitle] = useState("Subjects");
  const [questionCount, setQuestionCount] = useState(8);
  const [timerOn, setTimerOn] = useState(true);
  const [timerMinutes, setTimerMinutes] = useState(12);
  const [questionStatus, setQuestionStatus] = useState<QuestionStatus>("unused");
  const [quizMode, setQuizMode] = useState<QuizMode>("practice");
  const [quizTitle, setQuizTitle] = useState("Practice");
  const [report, setReport] = useState<ReportState | null>(
    initialScreen === "report" ? fallbackReport(initialExam) : null
  );
  const [guestPrompt, setGuestPrompt] = useState<HubLink | null>(null);
  const examAiThreadRef = useRef<Id<"aiThreads"> | null>(null);

  const [selectedChoice, setSelectedChoice] = useState("");
  const [bookmarked, setBookmarked] = useState(false);
  const [commentsByContent, setCommentsByContent] = useState<Record<string, ContentComment[]>>(
    () => seedComments(initialExam.id)
  );
  const [commentsReady, setCommentsReady] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState([{ role: "DrNote", text: "Ask me why each answer choice is right or wrong." }]);
  const [askInput, setAskInput] = useState("");
  const [askHistory, setAskHistory] = useState<{ role: string; text: string }[]>([
    { role: "DrNote", text: "Ask anything about this exam." },
  ]);
  const askWelcomeMessage = buildAskWelcomeMessage(
    user?.fullName ?? user?.username ?? user?.primaryEmailAddress?.emailAddress ?? "Student",
    selectedExam.title,
  );
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const savedDepth = Number.parseInt(sessionStorage.getItem(INTERNAL_HISTORY_KEY) ?? "0", 10);
      if (!Number.isFinite(savedDepth) || savedDepth < 0) {
        sessionStorage.setItem(INTERNAL_HISTORY_KEY, "0");
      }
    } catch {}
  }, []);

 function openPricing() {
    setShowPricing(false);
    router.push("/pricing");
  }

  function buildAskResponse(examTitle: string, prompt: string) {
    const cleaned = prompt.trim();
    return `On **${examTitle}**, I’d approach this as follows: start by isolating the clue cluster in the stem, map it to the objective, and rule out distractors that do not match the expected mechanism. Then confirm the remaining option against the exact wording and key diagnostic clues. You asked: ${cleaned}`;
  }

 const isInviteTrialActive = convexUser?.plan === "free" && Boolean(convexUser?.trialEndsAt && convexUser.trialEndsAt > Date.now());
 const effectivePlan = isInviteTrialActive ? "monthly" : (convexUser?.plan ?? plan);
  const isLoggedIn = isLoaded && !!isSignedIn;
  const trialDaysLeft = isInviteTrialActive
    ? Math.max(1, Math.ceil(((convexUser?.trialEndsAt ?? 0) - Date.now()) / DAY_MS))
    : 0;
	const remoteUsedQuestions = isSignedIn
    ? (usageToday?.questionsAnswered ?? 0) + usageBuffer
    : usedQuestions;
	const isFree = effectivePlan === "free";
	const questionLimit = planLimits?.questionsPerDay ?? DAILY_LIMIT;
	const planAllowsAi = effectivePlan !== "free";
	const planAllowsMock = effectivePlan !== "free";
  const canUseAi = isSignedIn
    ? (planLimits ? planLimits.aiAsksPerDay > 0 : planAllowsAi)
    : false;
  const canStartMock = isSignedIn
    ? (planLimits ? planLimits.mockExamsPerDay > 0 : planAllowsMock)
    : false;
	const remaining = Math.max(0, questionLimit - remoteUsedQuestions);
  const usageResetAt = getUsageResetTime(usageToday?.day) ?? (Date.now() + DAY_MS);
  const stats = dashboardStats ?? EMPTY_DASHBOARD_STATS;
  const masteryRows = topicMastery ?? [];

  useEffect(() => {
    setScreen(initialScreen);
    setActiveTab(initialTab);
    setSelectedExam(initialExam);
    if (initialScreen === "report") {
      setReport(current => current ?? fallbackReport(initialExam));
    }
  }, [initialExam, initialScreen, initialTab]);

  useEffect(() => {
    if (isSignedIn) {
      setUsageBuffer(0);
      setGuestPrompt(null);
    }
  }, [isSignedIn, usageToday?.day]);

  useEffect(() => {
    setGuestPrompt(null);
  }, [selectedExam.id]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const fromQuery = params.get(INVITE_QUERY_KEY)?.trim();
    if (fromQuery) {
      const code = fromQuery.trim();
      setInviteCode(code);
      params.delete(INVITE_QUERY_KEY);
      try {
        localStorage.setItem(INVITE_STORAGE_KEY, code);
        const hash = window.location.hash;
        const query = params.toString();
        const cleaned = `${window.location.pathname}${query ? `?${query}` : ""}${hash}`;
        window.history.replaceState({}, "", cleaned);
      } catch {}
      return;
    }
    try {
      const stored = localStorage.getItem(INVITE_STORAGE_KEY);
      if (stored) setInviteCode(stored);
    } catch {}
  }, [isLoaded]);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user) return;
    const invitedByClerkUserId = inviteCode ?? undefined;
    const run = async () => {
      try {
        await syncCurrentUser({
          email: user.primaryEmailAddress?.emailAddress,
          name: user.fullName ?? user.username ?? undefined,
          imageUrl: user.imageUrl,
          invitedByClerkUserId,
        });
      } catch {
        // Keep the UI usable if the realtime backend is temporarily unavailable.
        return;
      }
      if (!invitedByClerkUserId) return;
      setInviteCode(null);
      try {
        localStorage.removeItem(INVITE_STORAGE_KEY);
      } catch {}
    };
    void run();
  }, [isLoaded, isSignedIn, syncCurrentUser, user, inviteCode]);

  useEffect(() => {
    setAskHistory(current => {
      if (current.length === 0) {
        return [{ role: "DrNote", text: askWelcomeMessage }];
      }
      if (current.length === 1 && current[0].role === "DrNote") {
        return [{ role: "DrNote", text: askWelcomeMessage }];
      }
      return current;
    });
  }, [askWelcomeMessage]);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(COMMENT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Record<string, ContentComment[]>;
        setCommentsByContent({ ...seedComments(initialExam.id), ...parsed });
      }
    } catch {
      setCommentsByContent(seedComments(initialExam.id));
    } finally {
      setCommentsReady(true);
    }
  }, [initialExam.id]);

  useEffect(() => {
    if (!commentsReady) return;
    window.localStorage.setItem(COMMENT_STORAGE_KEY, JSON.stringify(commentsByContent));
  }, [commentsByContent, commentsReady]);

  useEffect(() => {
    function syncFromHistory() {
      try {
        const currentDepth = Number.parseInt(sessionStorage.getItem(INTERNAL_HISTORY_KEY) ?? "0", 10);
        sessionStorage.setItem(INTERNAL_HISTORY_KEY, String(Math.max(0, (Number.isFinite(currentDepth) ? currentDepth : 0) - 1)));
      } catch {}
      if (window.location.pathname === "/") {
        return;
      }
      const route = routeStateFromPath(window.location.pathname);
      setScreen(route.screen);
      setActiveTab(route.tab);
      if (route.examId) {
        setSelectedExam(examById(route.examId));
      }
      if (route.screen === "report") {
        setReport(current => current ?? fallbackReport(route.examId ? examById(route.examId) : selectedExam));
      }
    }

    window.addEventListener("popstate", syncFromHistory);
    return () => window.removeEventListener("popstate", syncFromHistory);
  }, [selectedExam]);

  useEffect(() => {
    if (!isLoaded) return;
    if ((screen === "ask" || screen === "mock") && isSignedIn && planLimits === undefined) {
      return;
    }
    if (screen === "ask") {
      if (!isSignedIn || !canUseAi) {
        openPricing();
        setScreen("exam");
      }
      return;
    }
    if (screen === "mock") {
      if (!isSignedIn || !canStartMock) {
        openPricing();
        setScreen("exam");
      }
    }
  }, [isLoaded, isSignedIn, planLimits, screen, canUseAi, canStartMock, selectedExam.id]);

  function pushPath(path: string, replace = false) {
    if (window.location.pathname !== path) {
      if (replace) window.history.replaceState({}, "", path);
      else {
        window.history.pushState({}, "", path);
        try {
          const currentDepth = Number.parseInt(sessionStorage.getItem(INTERNAL_HISTORY_KEY) ?? "0", 10);
          sessionStorage.setItem(
            INTERNAL_HISTORY_KEY,
            String((Number.isFinite(currentDepth) ? currentDepth : 0) + 1)
          );
        } catch {}
      }
    }
  }

  function goTo(s: Screen, exam: Exam = selectedExam, options: { replace?: boolean } = {}) {
    setScreen(s);
    pushPath(routeForScreen(s, exam.id), options.replace);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function closeToExamHome() {
    goTo("exam", selectedExam);
  }

  function openExam(exam: Exam) {
    setSelectedExam(exam);
    setActiveTab("learn");
    goTo("exam", exam);
  }

  function startPractice() {
    if (remoteUsedQuestions >= questionLimit) { setShowLimit(true); return; }
    setQuizMode("practice");
    setQuizTitle(selectedExam.title);
    setQuestionCount(8);
    setTimerOn(false);
    goTo("practice");
  }

	async function consumeQuestion() {
		if (!isSignedIn) {
			setUsedQuestions(v => isFree ? Math.min(questionLimit, v + 1) : v + 1);
			return true;
		}
		try {
			await consumeQuestionRemote({ count: 1 });
			setUsageBuffer(v => v + 1);
			return true;
		} catch {
			setShowLimit(true);
			return false;
		}
  }

  function openSetup(kind: SetupKind, title: string) {
    setSetupKind(kind);
    setSetupTitle(title);
    setShowSetup(true);
  }

  function startConfiguredPractice() {
    if (remoteUsedQuestions >= questionLimit) {
      setShowSetup(false);
      setShowLimit(true);
      return;
    }
    setSelectedChoice("");
    setShowSetup(false);
    setQuizMode("practice");
    setQuizTitle(setupTitle);
    goTo("practice");
  }

  async function startMockExam() {
    if (!isSignedIn) {
      openSignUp();
      return;
    }
    if (!canStartMock) {
      openPricing();
      return;
    }
    try {
      await startMockSession({
        examId: selectedExam.id,
        title: `${selectedExam.title} Mock Exam`,
        mode: "mock",
        source: "Realistic exam mode",
        totalQuestions: 20,
      });
    } catch {
      openPricing();
      return;
    }

    setSelectedChoice("");
    setQuizMode("mock");
    setQuizTitle(`${selectedExam.title} Mock Exam`);
    setQuestionCount(20);
    setTimerOn(true);
    setTimerMinutes(120);
    goTo("practice");
  }

  function completeQuiz(correct: number, total: number, mode: QuizMode, summary: QuizSummary = {}) {
    setReport({
      title: mode === "mock" ? `${selectedExam.title} Mock Exam` : quizTitle,
      source: mode === "mock" ? "Realistic exam mode" : setupTitle,
      score: Math.round((correct / total) * 100),
      correct,
      total,
      minutes: summary.minutes ?? (timerOn ? timerMinutes : Math.max(1, Math.round(total * 1.2))),
      mode,
      answered: summary.answered ?? total,
      unanswered: summary.unanswered ?? 0,
      flagged: summary.flagged ?? 0,
      subjectBreakdown: summary.subjectBreakdown,
      reviewItems: summary.reviewItems,
    });
    goTo("report");
  }

  function addContentComment(contentKey: string, text: string) {
    const t = text.trim();
    if (!t) return;
    const newComment: ContentComment = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      text: t,
      createdAt: new Intl.DateTimeFormat("en", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(new Date()),
    };
    setCommentsByContent(current => ({
      ...current,
      [contentKey]: [newComment, ...(current[contentKey] ?? [])],
    }));
  }

  function sendChat(e: FormEvent) {
    e.preventDefault();
    const t = chatInput.trim();
    if (!t) return;
    setChatHistory(h => [...h, { role: "You", text: t }, { role: "DrNote", text: "Focus on the symptom triad and the key screening test for this diagnosis." }]);
    setChatInput("");
  }

 function sendAsk(e: FormEvent) {
    e.preventDefault();
    const t = askInput.trim();
    if (!t) return;
    if (!isSignedIn) {
      openSignIn();
      return;
    }
    if (!canUseAi) {
      openPricing();
      return;
    }

    const answer = buildAskResponse(selectedExam.title, t);
    void (async () => {
      try {
        const threadId = examAiThreadRef.current ?? (
          await createExamAiThread({ examId: selectedExam.id, scope: "exam" })
        );
        examAiThreadRef.current = threadId;

        await addAiMessage({ threadId, role: "user", content: t });
        await addAiMessage({ threadId, role: "assistant", content: answer });

        setAskHistory(h => [...h, { role: "You", text: t }, { role: "DrNote", text: answer }]);
      } catch (error) {
        const message = error instanceof Error ? error.message : "";
        if (message.includes("AI tutor is not available") || message.includes("limit")) {
          openPricing();
          return;
        }
        setAskHistory(h => [...h, { role: "You", text: t }, { role: "DrNote", text: "The tutor is temporarily unavailable. Please try again in a moment." }]);
      }
    })();
    setAskInput("");
  }

  function openHomeTab(tab: Tab) {
    router.push(routeForHomeTab(tab));
  }

  function openBrowseHome() {
    try {
      const internalDepth = Number.parseInt(sessionStorage.getItem(INTERNAL_HISTORY_KEY) ?? "0", 10);
      if (hasPreviousSameOriginHistoryEntry() || (Number.isFinite(internalDepth) && internalDepth > 0)) {
        sessionStorage.setItem(INTERNAL_HISTORY_KEY, String(Math.max(0, internalDepth - 1)));
        router.back();
        return;
      }
    } catch {}
    router.push("/");
  }

  function closeGuestPrompt() {
    setGuestPrompt(null);
  }

  const isFullscreenExam = screen === "practice";
  const studyHeader = studyHeaderMeta(screen, selectedExam, report);

  return (
    <div className={`shell screen-${screen} tab-${activeTab}`}>
      {/* ── Main content ── */}
      <div className={`main${isFullscreenExam ? " quiz-main" : ""}`}>
        {!isFullscreenExam && screen === "home" && (
          <header className="mobile-topbar">
            <button className="mobile-logo" onClick={() => openHomeTab("learn")}>
              <div className="mobile-logo-mark">D</div>
              <span className="mobile-logo-name">DrNote</span>
            </button>
            <nav className="header-actions" aria-label="Header navigation">
              <button
                className={`header-action${activeTab === "learn" && screen === "home" ? " active" : ""}`}
                onClick={() => openHomeTab("learn")}
              >
                <House size={16} />
                <span className="header-action-label mobile-hide">Home</span>
              </button>
              <button
                className={`header-action${activeTab === "features" && screen === "home" ? " active" : ""}`}
                onClick={() => openHomeTab("features")}
              >
                <Sparkles size={16} />
                <span className="header-action-label mobile-hide">Features</span>
              </button>
              {isLoggedIn ? (
                <>
                  <button className="header-metric streak" aria-label={`${stats.streak} day streak`}>
                    <Flame size={16} /> {stats.streak}
                  </button>
                  <button
                    className="header-metric gems"
                    onClick={openPricing}
                    aria-label={`${remaining} questions remaining in this 24-hour window`}
                  >
                    {isFree ? <Lock size={15} /> : <InfinityIcon size={16} />}
                    {remaining}
                  </button>
                  <button
                    className={`header-metric rank${activeTab === "leaderboard" ? " active" : ""}`}
                    onClick={() => openHomeTab("leaderboard")}
                    aria-label={stats.rank ? `Rank number ${stats.rank}` : "Rank not available"}
                  >
                    <Trophy size={16} /> {stats.rank ? `#${stats.rank}` : "--"}
                  </button>
                  {isFree && (
                    <button
                      className="header-action compact pro"
                      onClick={openPricing}
                      aria-label="Upgrade to Pro"
                    >
                      <Crown size={15} />
                      <span className="header-action-label mobile-hide">Upgrade</span>
                    </button>
                  )}
                  <button
                    className={`header-icon-action${activeTab === "profile" ? " active" : ""}`}
                    onClick={() => openHomeTab("profile")}
                    aria-label="Profile"
                  >
                    <User size={17} />
                  </button>
                </>
              ) : (
                <>
                  <button className="header-action compact" onClick={() => { openSignIn(); }}>
                    <span className="header-action-label">Login</span>
                  </button>
                  <button className="header-action compact" onClick={() => { openSignUp(); }}>
                    <span className="header-action-label">Sign up</span>
                  </button>
                  {isFree && (
                    <button className="header-action compact pro" onClick={openPricing}>
                      <Crown size={15} />
                      <span className="header-action-label">Upgrade</span>
                    </button>
                  )}
                </>
              )}
            </nav>
          </header>
        )}

        {!isFullscreenExam && screen !== "home" && studyHeader && (
          <StudyHeader
            meta={studyHeader}
            examTitle={selectedExam.title}
            mergedWithSignup={Boolean(guestPrompt)}
            onBack={screen === "exam" ? (guestPrompt ? closeGuestPrompt : openBrowseHome) : closeToExamHome}
            onExamHome={closeToExamHome}
            onHome={openBrowseHome}
            activeTab={activeTab}
            isLoggedIn={isLoggedIn}
            isFree={isFree}
            remaining={remaining}
            stats={stats}
            onFeatures={() => openHomeTab("features")}
            onLeaderboard={() => openHomeTab("leaderboard")}
            onProfile={() => openHomeTab("profile")}
            onSignup={() => { openSignUp(); }}
            onSignIn={() => { openSignIn(); }}
            onPricing={openPricing}
          />
        )}

        {/* Screen router */}
        {screen === "home" && (
      <HomeScreen
            activeTab={activeTab}
            onExam={openExam}
            onSignup={() => { openSignUp(); }}
            onPricing={openPricing}
            categoryOptions={categoryOptions}
            remaining={remaining}
            questionLimit={questionLimit}
            selectedExam={selectedExam}
            onPractice={startPractice}
            onMock={startMockExam}
            isFree={isFree}
            isLoggedIn={isLoggedIn}
            stats={stats}
            topicMastery={masteryRows}
            leaderboardRows={leaderboardRows ?? []}
            isInviteTrial={isInviteTrialActive}
            inviteTrialDaysLeft={trialDaysLeft}
            inviteCode={convexUser?.clerkUserId}
          />
        )}

        {screen === "exam" && (
          <ExamScreen
            exam={selectedExam}
            onPractice={startPractice}
            onMock={startMockExam}
            onHub={(s) => goTo(s)}
            onSignup={() => { openSignUp(); }}
            onPricing={openPricing}
            isFree={isFree}
            isLoggedIn={isLoggedIn}
            stats={stats}
            guestPrompt={guestPrompt}
            onGuestPromptChange={setGuestPrompt}
          />
        )}

        {screen === "subjects" && (
          <SubjectsScreen
            exam={selectedExam}
            subjects={masteryRows}
            onStart={(title) => openSetup("subjects", title)}
          />
        )}

        {screen === "tags" && (
          <TagsScreen
            exam={selectedExam}
            onBack={closeToExamHome}
            onStart={(title) => openSetup("tags", title)}
            tagStatusCounts={tagStatusCounts ?? []}
            questionStatus={questionStatus}
          />
        )}

        {screen === "review" && (
          <ReviewScreen
            exam={selectedExam}
            onBack={closeToExamHome}
            onStart={(title) => openSetup("review", title)}
            stats={stats}
            reviewRows={reviewRows ?? []}
          />
        )}

        {screen === "analysis" && (
          <AnalysisScreen exam={selectedExam} onBack={closeToExamHome} stats={stats} topicMastery={masteryRows} />
        )}

        {screen === "sessions" && (
          <SessionsScreen
            exam={selectedExam}
            onBack={closeToExamHome}
            onResume={(title) => openSetup("session", title)}
            onReport={(session) => {
              const answered = session.answered;
              const total = session.totalQuestions;
              setReport({
                title: session.title,
                source: session.source ?? "Past session",
                score: answered ? Math.round((session.correct / answered) * 100) : 0,
                correct: session.correct,
                total,
                minutes: Math.max(1, Math.round(((session.completedAt ?? session.updatedAt) - session.startedAt) / 60000)),
                mode: session.mode,
                answered,
                unanswered: Math.max(0, total - answered),
                flagged: session.flagged,
              });
              goTo("report");
            }}
            sessions={sessions ?? []}
          />
        )}

        {screen === "notes" && (
          <NotesScreen exam={selectedExam} onBack={closeToExamHome} notes={notes ?? []} />
        )}

        {screen === "library" && (
          <LibraryScreen exam={selectedExam} onBack={closeToExamHome} libraryItems={libraryItems ?? []} />
        )}

        {screen === "ask" && (
          <AskScreen
            exam={selectedExam}
            onBack={closeToExamHome}
            askHistory={askHistory}
            askInput={askInput}
            setAskInput={setAskInput}
            sendAsk={sendAsk}
          />
        )}

        {screen === "practice" && (
          <PracticeScreen
            exam={selectedExam}
            title={quizTitle}
            mode={quizMode}
            totalQ={questionCount}
            timerOn={timerOn}
            timerMinutes={timerMinutes}
            selectedChoice={selectedChoice}
            setSelectedChoice={setSelectedChoice}
            bookmarked={bookmarked}
            setBookmarked={setBookmarked}
            commentsByContent={commentsByContent}
            addContentComment={addContentComment}
            chatOpen={chatOpen}
            setChatOpen={setChatOpen}
            chatHistory={chatHistory}
            chatInput={chatInput}
            setChatInput={setChatInput}
            sendChat={sendChat}
            onLimit={() => setShowLimit(true)}
            onPricing={openPricing}
            onNext={consumeQuestion}
            onExit={() => goTo("exam")}
            onComplete={completeQuiz}
            isFree={isFree}
            remaining={remaining}
            canUseAi={canUseAi}
            isSignedIn={!!isSignedIn}
            convexQuestions={questionBank ?? []}
          />
        )}

        {screen === "mock" && (
          <MockScreen exam={selectedExam} onBack={closeToExamHome} onStart={startMockExam} />
        )}

        {screen === "report" && report && (
          <ReportScreen
            report={report}
            onBack={closeToExamHome}
            onRestart={() => {
              if (report.mode === "mock") startMockExam();
              else openSetup(setupKind, report.source);
            }}
          />
        )}
      </div>

      {isSignedIn && canUseAi && screen !== "ask" && !(screen === "mock" || quizMode === "mock") && (
        <AssistantFloatingModal
          exam={selectedExam}
          askHistory={askHistory}
          askInput={askInput}
          setAskInput={setAskInput}
          sendAsk={sendAsk}
        />
      )}

      {/* ── Modals ── */}

      {showLimit && (
        <LimitModal
          remaining={remaining}
          questionLimit={questionLimit}
          usageResetAt={usageResetAt}
          onClose={() => setShowLimit(false)}
          onPricing={(plan) => {
            if (plan) setBillingPlan(plan);
            setShowLimit(false);
            openPricing();
          }}
        />
      )}

      {showPricing && (
        <PricingModal
          selectedPlan={billingPlan}
          setSelectedPlan={setBillingPlan}
          onClose={() => setShowPricing(false)}
          onSubscribe={() => {
            setPlan(billingPlan);
            router.push("/pricing");
            setShowPricing(false);
          }}
          isPaid={!isFree}
        />
      )}

      {showSetup && (
        <StudySetupModal
          kind={setupKind}
          title={setupTitle}
          questionCount={questionCount}
          setQuestionCount={setQuestionCount}
          timerOn={timerOn}
          setTimerOn={setTimerOn}
          timerMinutes={timerMinutes}
          setTimerMinutes={setTimerMinutes}
          status={questionStatus}
          setStatus={setQuestionStatus}
          onClose={() => setShowSetup(false)}
          onStart={startConfiguredPractice}
        />
      )}
    </div>
  );
}

function StudyHeader({
  meta,
  examTitle,
  mergedWithSignup,
  onBack,
  onExamHome,
  onHome,
  activeTab,
  isLoggedIn,
  isFree,
  remaining,
  stats,
  onFeatures,
  onLeaderboard,
  onProfile,
  onSignup,
  onSignIn,
  onPricing,
}: {
  meta: StudyHeaderMeta;
  examTitle: string;
  mergedWithSignup?: boolean;
  onBack: () => void;
  onExamHome: () => void;
  onHome: () => void;
  activeTab: Tab;
  isLoggedIn: boolean;
  isFree: boolean;
  remaining: number;
  stats: DashboardStats;
  onFeatures: () => void;
  onLeaderboard: () => void;
  onProfile: () => void;
  onSignup: () => void;
  onSignIn: () => void;
  onPricing: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pageIsExamHome = meta.page === examTitle;
  const runNav = (action: () => void, closeAfter = false) => () => {
    action();
    if (closeAfter) setMenuOpen(false);
  };
  const renderNavControls = (closeAfter = false) => isLoggedIn ? (
    <>
      <button
        type="button"
        className="header-action"
        onClick={runNav(onHome, closeAfter)}
      >
        <House size={16} />
        <span className="header-action-label">Home</span>
      </button>
      <button
        type="button"
        className={`header-action${activeTab === "features" ? " active" : ""}`}
        onClick={runNav(onFeatures, closeAfter)}
      >
        <Sparkles size={16} />
        <span className="header-action-label">Features</span>
      </button>
      <button type="button" className="header-metric streak" aria-label={`${stats.streak} day streak`}>
        <Flame size={16} /> {stats.streak}
      </button>
      <button
        type="button"
        className="header-metric gems"
        onClick={runNav(onPricing, closeAfter)}
        aria-label={`${remaining} questions remaining in this 24-hour window`}
      >
        {isFree ? <Lock size={15} /> : <InfinityIcon size={16} />}
        {remaining}
      </button>
      <button
        type="button"
        className={`header-metric rank${activeTab === "leaderboard" ? " active" : ""}`}
        onClick={runNav(onLeaderboard, closeAfter)}
        aria-label={stats.rank ? `Rank number ${stats.rank}` : "Rank not available"}
      >
        <Trophy size={16} /> {stats.rank ? `#${stats.rank}` : "--"}
      </button>
      {isFree && (
        <button
          type="button"
          className="header-action compact pro"
          onClick={runNav(onPricing, closeAfter)}
        >
          <Crown size={15} />
          <span className="header-action-label">Upgrade</span>
        </button>
      )}
      <button
        type="button"
        className={`header-icon-action${activeTab === "profile" ? " active" : ""}`}
        onClick={runNav(onProfile, closeAfter)}
        aria-label="Profile"
      >
        <User size={17} />
      </button>
    </>
  ) : (
    <>
      <button
        type="button"
        className="header-action"
        onClick={runNav(onHome, closeAfter)}
      >
        <House size={16} />
        <span className="header-action-label">Home</span>
      </button>
      <button
        type="button"
        className={`header-action${activeTab === "features" ? " active" : ""}`}
        onClick={runNav(onFeatures, closeAfter)}
      >
        <Sparkles size={16} />
        <span className="header-action-label">Features</span>
      </button>
      {isFree && (
        <button
          type="button"
          className="header-action compact pro"
          onClick={runNav(onPricing, closeAfter)}
        >
          <Crown size={15} />
          <span className="header-action-label">Upgrade</span>
        </button>
      )}
      <button type="button" className="header-action compact" onClick={runNav(onSignIn, closeAfter)}>
        <KeyRound size={15} />
        <span className="header-action-label">Login</span>
      </button>
      <button type="button" className="header-action compact" onClick={runNav(onSignup, closeAfter)}>
        <User size={15} />
        <span className="header-action-label">Sign up</span>
      </button>
    </>
  );

  return (
    <header className={`study-header accent-${meta.accent}${mergedWithSignup ? " merged-with-signup" : ""}`}>
      <div className="study-header-main">
        <div className="study-header-left">
          <button type="button" className="study-back-btn" onClick={onBack} aria-label="Go back">
            <ChevronLeft size={20} />
          </button>
          <button type="button" className="study-brand" onClick={onHome} aria-label="DrNote home">
            <span className="mobile-logo-mark">D</span>
            <span className="mobile-logo-name">DrNote</span>
          </button>
        </div>

        <nav className="header-actions study-header-actions" aria-label="Header navigation">
          {renderNavControls()}
        </nav>

        <button
          type="button"
          className="study-menu-btn"
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(current => !current)}
        >
          <Menu size={20} />
        </button>
      </div>

      {menuOpen && (
        <nav className="study-mobile-menu" aria-label="Mobile header navigation">
          {renderNavControls(true)}
        </nav>
      )}

      {!mergedWithSignup && (
        <div className="study-breadcrumb-row" aria-label="Study location">
          <div className="study-breadcrumb-inner">
            {pageIsExamHome ? (
              <span className="study-breadcrumb-pill study-breadcrumb-exam" title={examTitle}>
                <span>{examTitle}</span>
              </span>
            ) : (
              <button
                type="button"
                className="study-breadcrumb-pill study-breadcrumb-exam"
                title={examTitle}
                onClick={onExamHome}
                aria-label={`Open ${examTitle} overview`}
              >
                <span>{examTitle}</span>
              </button>
            )}
            {!pageIsExamHome && (
              <>
                <ChevronRight className="study-breadcrumb-arrow" size={20} aria-hidden="true" />
                <span className="study-breadcrumb-pill study-breadcrumb-current">{meta.page}</span>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

/* ── Home screen — switches by tab ───────────────── */
function HomeScreen({
  activeTab, onExam, onSignup, onPricing,
  categoryOptions,
	  remaining, questionLimit, selectedExam, onPractice, onMock, isFree, isLoggedIn, stats, topicMastery,
  leaderboardRows,
  isInviteTrial,
  inviteTrialDaysLeft,
  inviteCode,
}: {
  activeTab: Tab;
  onExam: (e: Exam) => void;
  onSignup: () => void;
  onPricing: () => void;
  categoryOptions: string[];
  remaining: number;
	  questionLimit: number;
  selectedExam: Exam;
  onPractice: () => void;
  onMock: () => void;
  isFree: boolean;
  isLoggedIn: boolean;
  stats: DashboardStats;
  leaderboardRows: LeaderboardRow[];
  topicMastery: TopicMasteryRow[];
  isInviteTrial: boolean;
  inviteTrialDaysLeft: number;
  inviteCode?: string;
}) {
	  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("All");
  const [visible, setVisible] = useState(EXAM_PAGE_SIZE);
  const remainingPercent = questionLimit > 0 ? Math.round((remaining / questionLimit) * 100) : 0;
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return exams
      .filter(e =>
        (category === "All" || e.category === category) &&
        (q === "" || e.title.toLowerCase().includes(q))
      )
      .sort((a, b) => b.questions - a.questions);
  }, [query, category]);
  useEffect(() => {
    if (category !== "All" && !categoryOptions.includes(category)) {
      setCategory("All");
    }
  }, [category, categoryOptions]);
  const shown = filtered.slice(0, visible);
  useEffect(() => {
    setVisible(EXAM_PAGE_SIZE);
  }, [query, category]);
  const clearFilters = () => {
    setQuery("");
    setCategory("All");
  };

  if (activeTab === "leaderboard") {
    return isLoggedIn ? (
      <LeaderboardTab rows={leaderboardRows ?? []} />
    ) : (
      <GuestAccessPrompt
        icon={Trophy}
        title="Sign up to join rankings"
        text="Weekly XP, streak shields, and your rank are available after you create an account."
        onSignup={onSignup}
      />
    );
  }
  if (activeTab === "profile") {
    return isLoggedIn ? (
      <ProfileTab
        onPricing={onPricing}
        isFree={isFree}
        isInviteTrial={isInviteTrial}
        inviteTrialDaysLeft={inviteTrialDaysLeft}
        inviteCode={inviteCode}
        stats={stats}
        topicMastery={topicMastery}
      />
    ) : (
      <GuestAccessPrompt
        icon={User}
        title="Sign up to view your profile"
        text="Accuracy, streaks, topic mastery, and study history start tracking after sign-up."
        onSignup={onSignup}
      />
    );
  }
  if (activeTab === "features") {
    return <FeaturesTab onSignup={onSignup} onPricing={onPricing} />;
  }
  return (
    <div className="screen home-screen">
      <div className="home-bg-shapes" aria-hidden="true">
        <span className="home-bg-shape home-bg-shape-yellow" />
        <span className="home-bg-shape home-bg-shape-blue" />
        <span className="home-bg-shape home-bg-shape-red" />
        <span className="home-bg-shape home-bg-shape-purple" />
      </div>
      {/* hero */}
      <div className={`hero-banner${isLoggedIn ? "" : " guest-hero"}`}>
        <div className="hero-copy">
          {!isLoggedIn && (
            <div className="hero-icon-orbit" aria-hidden="true">
              <Sparkles className="hero-icon hero-icon-one" size={30} />
              <BookOpen className="hero-icon hero-icon-two" size={30} />
              <Trophy className="hero-icon hero-icon-three" size={30} />
            </div>
          )}
          <h1>{isLoggedIn ? "Ready for your next block?" : "Pass your next exam"}</h1>
          <p>
            {isLoggedIn
              ? isFree
                ? `${remaining} of ${questionLimit} free questions left in this 24-hour window.`
                : "Unlimited questions available today."
	                : "Pick any exam and start free practice in seconds."}
	            </p>
        </div>
        <div className="hero-daily">
          {isLoggedIn && (
            <div className="hero-limit">
              <div>
                <strong>{isFree ? remaining : "∞"}</strong>
                <span>{isFree ? "left in this window" : "unlimited"}</span>
              </div>
              <div className="progress-bar">
                <div
	                  className="progress-fill"
	                  style={{ width: `${isFree ? remainingPercent : 100}%` }}
	                />
	              </div>
	            </div>
          )}
          {isLoggedIn && (
            <button className="btn btn-green btn-sm" onClick={onPractice}>
              <Sparkles size={16} />
              Start
            </button>
          )}
        </div>
      </div>

      <div className="choose-exam-toolbar">
        <div className="choose-exam-search">
          <Search size={19} />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search exams"
            aria-label="Search exams"
          />
          {query && (
            <button onClick={() => setQuery("")} className="icon-clear" aria-label="Clear search">
              <X size={16} />
            </button>
          )}
        </div>
        <div className="choose-exam-filters">
          {categoryOptions.map(categoryName => (
            <button
              key={categoryName}
              className={`choose-exam-pill${category === categoryName ? " active" : ""}`}
              onClick={() => setCategory(categoryName)}
              aria-pressed={category === categoryName}
            >
              {categoryName}
            </button>
          ))}
        </div>
      </div>

      <div className="choose-exam-grid">
        {shown.map((exam, index) => (
          <ExamCard
            key={exam.id}
            exam={exam}
            accent={EXAM_CARD_ACCENTS[index % EXAM_CARD_ACCENTS.length]}
            onClick={() => onExam(exam)}
          />
        ))}
        {filtered.length === 0 && (
          <div className="choose-exam-empty">
            <Search size={28} />
            <p>No exams match "{query}"</p>
            <button className="btn btn-outline btn-sm" onClick={clearFilters}>
              Clear filters
            </button>
          </div>
        )}
      </div>

      <div className="choose-exam-load-more">
        {visible < filtered.length && (
          <button className="btn btn-green" onClick={() => setVisible(v => v + EXAM_PAGE_SIZE)}>
            Load more exams
          </button>
        )}
      </div>

      <HomeDemoQuiz isLoggedIn={isLoggedIn} onSignup={onSignup} onPractice={onPractice} />

      <HomeFeatureShowcase isLoggedIn={isLoggedIn} onSignup={onSignup} onPractice={onPractice} />
    </div>
  );
}

type FeatureDemoKey = "practice" | "ask" | "review" | "notes" | "tags" | "mock" | "analysis" | "sessions" | "library";

const FEATURE_DEMOS: Array<{
  key: FeatureDemoKey;
  title: string;
  text: string;
  icon: typeof BookOpen;
  stat: string;
  accent: "green" | "blue" | "purple" | "orange" | "yellow" | "red";
}> = [
  {
    key: "practice",
    title: "Practice question bank",
    text: "Start focused exam blocks with real answer choices, progress, and explanations in the same study surface.",
    icon: BookOpen,
    stat: "8,005 questions",
    accent: "green",
  },
  {
    key: "ask",
    title: "Ask DrNote AI",
    text: "Ask why an answer is right, compare choices, get mnemonics, and keep a saved tutor history.",
    icon: Bot,
    stat: "Saved chat",
    accent: "purple",
  },
  {
    key: "review",
    title: "Mistake review",
    text: "Rebuild blocks from incorrect, flagged, correct, or unused questions before exam day.",
    icon: History,
    stat: "Smart queues",
    accent: "orange",
  },
  {
    key: "notes",
    title: "Notes",
    text: "Turn explanations into high-yield notes with recall dates, decks, and compact topic tags.",
    icon: FileText,
    stat: "Fast recall",
    accent: "yellow",
  },
  {
    key: "tags",
    title: "Tags",
    text: "Label weak topics, recall dates, image questions, and repeat misses, then drill exactly what you choose.",
    icon: Target,
    stat: "Custom blocks",
    accent: "blue",
  },
  {
    key: "mock",
    title: "Timed mock exams",
    text: "Run self-assessments with timers, question counts, pause controls, and automatic score reports.",
    icon: ClipboardCheck,
    stat: "Real exam pacing",
    accent: "blue",
  },
  {
    key: "analysis",
    title: "Performance analysis",
    text: "Track accuracy, mastery, weak topics, streaks, and pacing across each medical exam.",
    icon: BarChart3,
    stat: "Topic gaps",
    accent: "green",
  },
  {
    key: "sessions",
    title: "Sessions",
    text: "Pause, resume, restart, or review previous study blocks without losing reports.",
    icon: CalendarDays,
    stat: "Resume later",
    accent: "red",
  },
  {
    key: "library",
    title: "Library",
    text: "Save tables, diagrams, explanations, and reference material into a personal study shelf.",
    icon: Library,
    stat: "Reference shelf",
    accent: "purple",
  },
];

function FeaturesTab({
  onSignup,
  onPricing,
}: {
  onSignup: () => void;
  onPricing: () => void;
}) {
  const [reviewFilter, setReviewFilter] = useState<ReviewFilter>("all");
  const [selectedTags, setSelectedTags] = useState<string[]>(["cardiology weak", "hypertension"]);
  const reviewRows = REVIEW_QUESTION_BANK
    .filter(row => reviewFilter === "all" || row.status === reviewFilter)
    .slice(0, 3);

  function toggleTag(tag: string) {
    setSelectedTags(current =>
      current.includes(tag) ? current.filter(t => t !== tag) : [...current, tag]
    );
  }

  return (
    <div className="screen features-page">
      <div className="simple-page-hero teal">
        <Sparkles size={28} />
        <h1>Features</h1>
        <p>Everything in DrNote is built around medical exam practice, review, and measurable progress.</p>
      </div>

      <div className="features-overview">
        <section className="features-panel">
          <div>
            <span className="badge badge-green">Study workflow</span>
            <h2>From exam choice to score report</h2>
            <p>
              Pick USMLE, MRCP, SMLE, or MCCQE, then move between focused drills, mock exams,
              review queues, notes, and analytics from the same app shell.
            </p>
          </div>
          <div className="features-panel-actions">
            <button className="btn btn-green" onClick={onSignup}>
              <User size={16} />
              Sign up
            </button>
            <button className="btn btn-outline" onClick={onPricing}>
              <Crown size={16} />
              Pro
            </button>
          </div>
        </section>

        <div className="features-demo-list">
          {FEATURE_DEMOS.map(item => {
            const Icon = item.icon;
            return (
              <section className={`feature-demo accent-${item.accent}`} key={item.key} aria-labelledby={`feature-demo-${item.key}`}>
                <div className="feature-demo-copy">
                  <span className="feature-demo-badge"><Icon size={14} strokeWidth={2.7} /> {item.stat}</span>
                  <h2 id={`feature-demo-${item.key}`}>{item.title}</h2>
                  <p>{item.text}</p>
                </div>
                <div className="feature-demo-card">
                  <FeatureDemoPreview
                    type={item.key}
                    reviewFilter={reviewFilter}
                    reviewRows={reviewRows}
                    onReviewFilter={setReviewFilter}
                    selectedTags={selectedTags}
                    onToggleTag={toggleTag}
                  />
                </div>
              </section>
            );
          })}
        </div>

        <section className="features-pro-panel">
          <div>
            <span className="badge badge-yellow">
              <Crown size={13} /> DrNote Pro
            </span>
            <h2>Pro includes the full study set</h2>
          </div>
          <div className="features-list features-list-page">
            {FEATURES.map(f => (
              <div key={f} className="feature-item">
                <div className="feature-check"><Check size={12} /></div>
                {f}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function FeatureDemoPreview({
  type,
  reviewFilter,
  reviewRows,
  onReviewFilter,
  selectedTags,
  onToggleTag,
}: {
  type: FeatureDemoKey;
  reviewFilter: ReviewFilter;
  reviewRows: typeof REVIEW_QUESTION_BANK;
  onReviewFilter: (filter: ReviewFilter) => void;
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
}) {
  if (type === "practice") {
    const sample = PRACTICE_QUESTIONS[0];
    return (
      <>
        <div className="feature-demo-topbar">
          <span className="home-demo-logo" aria-hidden="true">D</span>
          <div className="home-demo-progress" aria-hidden="true">
            <div className="home-demo-progress-fill" style={{ width: "33%" }} />
          </div>
          <span className="home-demo-count">1/3</span>
        </div>
        <div className="home-demo-meta">
          <span className="home-demo-chip">{sample.topic}</span>
          <span className="home-demo-chip soft">{sample.subtopic}</span>
        </div>
        <p className="feature-demo-stem">{sample.prompt}</p>
        <div className="home-demo-choices feature-demo-choices">
          {sample.options.slice(0, 3).map(option => (
            <div className="home-demo-choice feature-demo-choice" key={option.id}>
              <span className="home-demo-key">{option.id}</span>
              <span className="home-demo-choice-label">{option.label}</span>
            </div>
          ))}
        </div>
      </>
    );
  }

  if (type === "ask") {
    return (
      <div className="showcase-panel">
        <div className="showcase-chat">
          <div className="showcase-chat-msg bot">
            <span className="showcase-chat-avatar"><Bot size={15} strokeWidth={2.5} /></span>
            <span className="showcase-chat-bubble">Why are urinary metanephrines the best next clue?</span>
          </div>
          <div className="showcase-chat-msg you">
            <span className="showcase-chat-bubble">Explain it like an exam shortcut.</span>
          </div>
          <div className="showcase-chat-msg bot">
            <span className="showcase-chat-avatar"><Bot size={15} strokeWidth={2.5} /></span>
            <span className="showcase-chat-bubble">Episodic hypertension, sweating, palpitations, and headache point to catecholamine surges.</span>
          </div>
        </div>
      </div>
    );
  }

  if (type === "review") {
    return (
      <div className="showcase-panel">
        <div className="showcase-mini-tabs">
          {REVIEW_TABS.map(tab => (
            <button
              key={tab.value}
              className={`showcase-mini-pill${reviewFilter === tab.value ? " active" : ""}`}
              onClick={() => onReviewFilter(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="showcase-rows">
          {reviewRows.map(row => {
            const meta = REVIEW_STATUS_META[row.status];
            const StatusIcon = meta.Icon;
            return (
              <div key={row.id} className={`showcase-row status-${row.status}`}>
                <span className="showcase-row-icon"><StatusIcon size={14} strokeWidth={3} /></span>
                <span className="showcase-row-main">
                  <strong>{row.topic}</strong>
                  <span>{row.stem}</span>
                </span>
                <span className="showcase-row-note">{row.note}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (type === "notes") {
    return (
      <div className="showcase-panel showcase-notes">
        {NOTE_BANK.slice(0, 2).map(note => (
          <div className="showcase-note" key={note.title}>
            <div className="showcase-note-top">
              <span className="showcase-badge yellow">{note.kind}</span>
              <span className="showcase-note-review"><Clock size={12} strokeWidth={2.8} /> {note.review}</span>
            </div>
            <strong>{note.title}</strong>
            <p>{note.text}</p>
            <div className="showcase-chiprow">
              {note.tags.map(tag => <span key={tag} className="showcase-chip">{tag}</span>)}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === "tags") {
    return (
      <div className="showcase-panel">
        <div className="showcase-tagcloud">
          {TAG_BANK.slice(0, 12).map(tag => (
            <button
              key={tag}
              className={`showcase-tag${selectedTags.includes(tag) ? " active" : ""}`}
              onClick={() => onToggleTag(tag)}
              aria-pressed={selectedTags.includes(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
        <p className="showcase-hint">
          {selectedTags.length} selected - ready for a custom practice block.
        </p>
      </div>
    );
  }

  if (type === "mock") {
    return (
      <div className="showcase-mock">
        <div className="showcase-mock-head">
          <span className="showcase-mock-icon"><ClipboardCheck size={22} strokeWidth={2.5} /></span>
          <div>
            <strong>USMLE Step 1 Mock Exam</strong>
            <span>Timed mode · last attempt 76%</span>
          </div>
        </div>
        <div className="showcase-mock-stats">
          <span><List size={15} strokeWidth={2.8} /> 120 questions</span>
          <span><Timer size={15} strokeWidth={2.8} /> 120 minutes</span>
          <span><Trophy size={15} strokeWidth={2.8} /> Auto-scored</span>
        </div>
        <div className="showcase-mock-bar">
          <div className="showcase-mock-fill" style={{ width: "76%" }} />
        </div>
      </div>
    );
  }

  if (type === "analysis") {
    return (
      <div className="showcase-panel">
        <div className="showcase-stat-chips">
          <span className="showcase-badge green"><Target size={13} strokeWidth={2.8} /> 76% accuracy</span>
          <span className="showcase-badge orange"><Flame size={13} strokeWidth={2.8} /> 12-day streak</span>
          <span className="showcase-badge purple"><Trophy size={13} strokeWidth={2.8} /> Rank #23</span>
        </div>
        <div className="showcase-bars">
          {SHOWCASE_ANALYSIS_ROWS.map(row => (
            <div className="showcase-bar-row" key={row.topic}>
              <span className="showcase-bar-label">{row.topic}</span>
              <div className="showcase-bar-track">
                <div
                  className="showcase-bar-fill"
                  style={{ width: `${row.mastery}%`, background: masteryColor(row.mastery).fill }}
                />
              </div>
              <span className="showcase-bar-value">{row.mastery}%</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === "sessions") {
    return (
      <div className="showcase-rows">
        {SESSION_BANK.slice(0, 3).map(session => (
          <div key={session.name} className="showcase-row">
            <span className="showcase-row-icon session"><CalendarDays size={14} strokeWidth={2.8} /></span>
            <span className="showcase-row-main">
              <strong>{session.name}</strong>
              <span>{session.questions} questions · {session.date}</span>
            </span>
            <span className={`showcase-badge${session.status === "Resume" ? " green" : ""}`}>
              {session.status === "Resume" ? "Resume" : session.score}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="showcase-rows">
      {LIBRARY_ITEMS.slice(0, 3).map(item => (
        <div key={item.title} className="showcase-row">
          <span className="showcase-row-icon library"><Library size={14} strokeWidth={2.8} /></span>
          <span className="showcase-row-main">
            <strong>{item.title}</strong>
            <span>{item.summary}</span>
          </span>
          <span className="showcase-badge blue">{item.type}</span>
        </div>
      ))}
    </div>
  );
}

function HomeDemoQuiz({
  isLoggedIn,
  onSignup,
  onPractice,
}: {
  isLoggedIn: boolean;
  onSignup: () => void;
  onPractice: () => void;
}) {
  const [qIndex, setQIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const demoQuestion = PRACTICE_QUESTIONS[qIndex];
  const isCorrect = picked === demoQuestion.correct;
  const correctOption = demoQuestion.options.find(option => option.id === demoQuestion.correct);
  const wrongChoices = demoQuestion.options.filter(option => option.id !== demoQuestion.correct);
  const progressPercent = ((qIndex + (picked !== null ? 1 : 0)) / PRACTICE_QUESTIONS.length) * 100;

  function nextQuestion() {
    setPicked(null);
    setQIndex(i => (i + 1) % PRACTICE_QUESTIONS.length);
  }

  return (
    <section className="home-demo" aria-label="Interactive sample question">
      <div className="home-demo-head">
        <span className="home-demo-badge"><Sparkles size={14} /> Try it now</span>
        <h2>Answer a real exam question</h2>
        <p>No account needed — this is exactly how practice feels in DrNote.</p>
      </div>
      <div className="home-demo-card">
        <div className="home-demo-topbar">
          <span className="home-demo-logo" aria-hidden="true">D</span>
          <div
            className="home-demo-progress"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progressPercent)}
            aria-label="Demo progress"
          >
            <div className="home-demo-progress-fill" style={{ width: `${progressPercent}%` }} />
          </div>
          <span className="home-demo-count">{qIndex + 1}/{PRACTICE_QUESTIONS.length}</span>
        </div>
        <div className="home-demo-meta">
          <span className="home-demo-chip">{demoQuestion.topic}</span>
          <span className="home-demo-chip soft">{demoQuestion.subtopic}</span>
        </div>
        <p className="home-demo-stem">{demoQuestion.prompt}</p>
        <div className="home-demo-choices">
          {demoQuestion.options.map(option => {
            const isPicked = picked === option.id;
            const showCorrect = picked !== null && option.id === demoQuestion.correct;
            const showWrong = isPicked && option.id !== demoQuestion.correct;
            return (
              <button
                key={option.id}
                className={`home-demo-choice${showCorrect ? " correct" : ""}${showWrong ? " wrong" : ""}`}
                onClick={() => setPicked(option.id)}
                disabled={picked !== null}
                aria-pressed={isPicked}
              >
                <span className="home-demo-key">{option.id}</span>
                <span className="home-demo-choice-label">{option.label}</span>
                {showCorrect && <Check size={20} strokeWidth={3} />}
                {showWrong && <X size={20} strokeWidth={3} />}
              </button>
            );
          })}
        </div>
        {picked !== null && (
          <div className="home-demo-exp">
            <div className={`home-demo-exp-head${isCorrect ? " ok" : " no"}`}>
              {isCorrect ? <CheckCircle2 size={26} strokeWidth={2.5} /> : <XCircle size={26} strokeWidth={2.5} />}
              <div>
                <strong>{isCorrect ? "Correct!" : "Incorrect"}</strong>
                <span>Correct answer: {demoQuestion.correct}. {correctOption?.label}</span>
              </div>
            </div>
            <div className="home-demo-exp-body">
              <h4>Explanation</h4>
              <p>{demoQuestion.explanation}</p>
              <h4>Why the other choices are wrong</h4>
              <div className="home-demo-why">
                {wrongChoices.map(option => (
                  <div className="home-demo-why-row" key={option.id}>
                    <span className="home-demo-why-key">{option.id}</span>
                    <span>
                      <strong>{option.label}.</strong> {demoQuestion.why[option.id]}
                    </span>
                  </div>
                ))}
              </div>
              <div className="home-demo-objective">
                <h4>Educational objective</h4>
                <p>{demoQuestion.objective}</p>
              </div>
              <div className="home-demo-actions">
                <button className="btn btn-green" onClick={isLoggedIn ? onPractice : onSignup}>
                  <Sparkles size={16} />
                  {isLoggedIn ? "Start practicing" : "Sign up — it's free"}
                </button>
                <button className="btn btn-outline" onClick={nextQuestion}>
                  Next question
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

type ShowcaseKey = "ask" | "review" | "notes" | "tags" | "mock" | "analysis" | "sessions" | "library";

const SHOWCASE_TABS: Array<{ key: ShowcaseKey; label: string; icon: typeof BookOpen; blurb: string }> = [
  { key: "ask", label: "Ask AI", icon: MessageCircle, blurb: "A tutor inside every question — ask why an answer is right, get mnemonics, or plan your review. Try it below." },
  { key: "review", label: "Review", icon: History, blurb: "Every flagged, incorrect, and correct question is saved automatically — clear your mistakes before exam day." },
  { key: "notes", label: "Notes", icon: FileText, blurb: "High-yield notes and bite-size reminders with spaced recall dates." },
  { key: "tags", label: "Tags", icon: Target, blurb: "Label questions by topic, weakness, or recall date — then drill exactly what you pick." },
  { key: "mock", label: "Mock Exam", icon: ClipboardCheck, blurb: "Full-length, timed self-assessments that score themselves." },
  { key: "analysis", label: "Analysis", icon: BarChart3, blurb: "Mastery, accuracy, and pacing tracked per topic — always know what to study next." },
  { key: "sessions", label: "Sessions", icon: CalendarDays, blurb: "Pause any block and resume later. Every session keeps its full report." },
  { key: "library", label: "Library", icon: Library, blurb: "Save explanations, tables, and diagrams into your personal reference shelf." },
];

const SHOWCASE_ANALYSIS_ROWS = [
  { topic: "Cardiology", mastery: 82 },
  { topic: "Respiratory", mastery: 64 },
  { topic: "Renal", mastery: 45 },
  { topic: "Neurology", mastery: 71 },
];

const SHOWCASE_ASK_WELCOME = "Hi! I'm DrNote AI. Ask me anything — a tricky concept, why an answer choice is wrong, or how to plan your review.";

const SHOWCASE_ASK_REPLIES = [
  "Good question! Here's how I'd think about it: isolate the key clues in the stem, map them to the underlying mechanism, then rule out choices that don't fit. In the full app I break down every answer choice exactly like this — with your saved history.",
  "Quick framework: start from the physiology, not the buzzword. For example, suppressed renin with high aldosterone points straight to primary hyperaldosteronism. Sign up and I'll explain any question you miss, step by step.",
  "Here's a memory hook for that: tie the finding to its trigger. Episodic hypertension + sweating + headache = catecholamine surges = pheochromocytoma. Inside DrNote I can also build a spaced recall plan from the questions you get wrong.",
];

function HomeFeatureShowcase({
  isLoggedIn,
  onSignup,
  onPractice,
}: {
  isLoggedIn: boolean;
  onSignup: () => void;
  onPractice: () => void;
}) {
  const [reviewFilter, setReviewFilter] = useState<ReviewFilter>("all");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [askInput, setAskInput] = useState("");
  const [askMessages, setAskMessages] = useState<Array<{ role: "you" | "bot"; text: string }>>([
    { role: "bot", text: SHOWCASE_ASK_WELCOME },
  ]);
  const askChatRef = useRef<HTMLDivElement | null>(null);
  const reviewRows = REVIEW_QUESTION_BANK
    .filter(row => reviewFilter === "all" || row.status === reviewFilter)
    .slice(0, 4);

  useEffect(() => {
    const chat = askChatRef.current;
    if (chat) chat.scrollTop = chat.scrollHeight;
  }, [askMessages]);

  function toggleTag(tag: string) {
    setSelectedTags(current =>
      current.includes(tag) ? current.filter(t => t !== tag) : [...current, tag]
    );
  }

  function sendDemoAsk(e: FormEvent) {
    e.preventDefault();
    const text = askInput.trim();
    if (!text) return;
    setAskMessages(current => {
      const askedCount = current.filter(message => message.role === "you").length;
      const reply = SHOWCASE_ASK_REPLIES[askedCount % SHOWCASE_ASK_REPLIES.length];
      return [...current, { role: "you", text }, { role: "bot", text: reply }];
    });
    setAskInput("");
  }

  return (
    <section className="home-showcase" aria-label="Feature tour">
      <div className="home-demo-head">
        <span className="home-demo-badge"><Zap size={14} /> Feature tour</span>
        <h2>Everything you need to pass — in one place</h2>
        <p>Tap around. This is real app UI, not screenshots.</p>
      </div>

      <div className="home-showcase-list">
        {SHOWCASE_TABS.map(tab => {
          const FeatureIcon = tab.icon;
          const active = tab.key;
          return (
            <article
              key={tab.key}
              className="home-showcase-item"
              aria-labelledby={`home-showcase-${tab.key}`}
            >
              <div className="home-showcase-item-copy">
                <span className="home-showcase-icon"><FeatureIcon size={18} strokeWidth={2.6} /></span>
                <div>
                  <h3 id={`home-showcase-${tab.key}`}>{tab.label}</h3>
                  <p>{tab.blurb}</p>
                </div>
              </div>

              <div className="home-showcase-card">
                {active === "ask" && (
                  <div className="showcase-panel">
                    <div className="showcase-chat" ref={askChatRef} aria-live="polite">
                      {askMessages.map((message, index) => (
                        <div key={index} className={`showcase-chat-msg ${message.role}`}>
                          {message.role === "bot" && (
                            <span className="showcase-chat-avatar"><Bot size={15} strokeWidth={2.5} /></span>
                          )}
                          <span className="showcase-chat-bubble">{message.text}</span>
                        </div>
                      ))}
                    </div>
                    <form className="showcase-chat-form" onSubmit={sendDemoAsk}>
                      <input
                        value={askInput}
                        onChange={e => setAskInput(e.target.value)}
                        placeholder="Ask anything - try why metanephrines?"
                        aria-label="Ask DrNote AI a question"
                      />
                      <button type="submit" className="showcase-chat-send" aria-label="Send" disabled={!askInput.trim()}>
                        <Send size={16} strokeWidth={2.6} />
                      </button>
                    </form>
                  </div>
                )}

                {active === "review" && (
                  <div className="showcase-panel">
                    <div className="showcase-mini-tabs">
                      {REVIEW_TABS.map(tab => (
                        <button
                          key={tab.value}
                          className={`showcase-mini-pill${reviewFilter === tab.value ? " active" : ""}`}
                          onClick={() => setReviewFilter(tab.value)}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                    <div className="showcase-rows">
                      {reviewRows.map(row => {
                        const meta = REVIEW_STATUS_META[row.status];
                        const StatusIcon = meta.Icon;
                        return (
                          <div key={row.id} className={`showcase-row status-${row.status}`}>
                            <span className="showcase-row-icon"><StatusIcon size={14} strokeWidth={3} /></span>
                            <span className="showcase-row-main">
                              <strong>{row.topic}</strong>
                              <span>{row.stem}</span>
                            </span>
                            <span className="showcase-row-note">{row.note}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {active === "notes" && (
                  <div className="showcase-panel showcase-notes">
                    {NOTE_BANK.slice(0, 2).map(note => (
                      <div className="showcase-note" key={note.title}>
                        <div className="showcase-note-top">
                          <span className="showcase-badge yellow">{note.kind}</span>
                          <span className="showcase-note-review"><Clock size={12} strokeWidth={2.8} /> {note.review}</span>
                        </div>
                        <strong>{note.title}</strong>
                        <p>{note.text}</p>
                        <div className="showcase-chiprow">
                          {note.tags.map(tag => <span key={tag} className="showcase-chip">{tag}</span>)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {active === "tags" && (
                  <div className="showcase-panel">
                    <div className="showcase-tagcloud">
                      {TAG_BANK.slice(0, 14).map(tag => (
                        <button
                          key={tag}
                          className={`showcase-tag${selectedTags.includes(tag) ? " active" : ""}`}
                          onClick={() => toggleTag(tag)}
                          aria-pressed={selectedTags.includes(tag)}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                    <p className="showcase-hint">
                      {selectedTags.length > 0
                        ? `${selectedTags.length} tag${selectedTags.length === 1 ? "" : "s"} selected - in the app this builds a custom practice block.`
                        : "Tap tags to build a custom practice block."}
                    </p>
                  </div>
                )}

                {active === "mock" && (
                  <div className="showcase-panel">
                    <div className="showcase-mock">
                      <div className="showcase-mock-head">
                        <span className="showcase-mock-icon"><ClipboardCheck size={22} strokeWidth={2.5} /></span>
                        <div>
                          <strong>USMLE Step 1 Mock Exam</strong>
                          <span>Realistic exam mode · last attempt 76%</span>
                        </div>
                      </div>
                      <div className="showcase-mock-stats">
                        <span><List size={15} strokeWidth={2.8} /> 20 questions</span>
                        <span><Timer size={15} strokeWidth={2.8} /> 120 minutes</span>
                        <span><Trophy size={15} strokeWidth={2.8} /> Auto-scored</span>
                      </div>
                      <div className="showcase-mock-bar">
                        <div className="showcase-mock-fill" style={{ width: "76%" }} />
                      </div>
                    </div>
                  </div>
                )}

                {active === "analysis" && (
                  <div className="showcase-panel">
                    <div className="showcase-stat-chips">
                      <span className="showcase-badge green"><Target size={13} strokeWidth={2.8} /> 76% accuracy</span>
                      <span className="showcase-badge orange"><Flame size={13} strokeWidth={2.8} /> 12-day streak</span>
                      <span className="showcase-badge purple"><Trophy size={13} strokeWidth={2.8} /> Rank #23</span>
                    </div>
                    <div className="showcase-bars">
                      {SHOWCASE_ANALYSIS_ROWS.map(row => (
                        <div className="showcase-bar-row" key={row.topic}>
                          <span className="showcase-bar-label">{row.topic}</span>
                          <div className="showcase-bar-track">
                            <div
                              className="showcase-bar-fill"
                              style={{ width: `${row.mastery}%`, background: masteryColor(row.mastery).fill }}
                            />
                          </div>
                          <span className="showcase-bar-value">{row.mastery}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {active === "sessions" && (
                  <div className="showcase-panel">
                    <div className="showcase-rows">
                      {SESSION_BANK.map(session => (
                        <div key={session.name} className="showcase-row">
                          <span className="showcase-row-icon session"><CalendarDays size={14} strokeWidth={2.8} /></span>
                          <span className="showcase-row-main">
                            <strong>{session.name}</strong>
                            <span>{session.questions} questions · {session.date}</span>
                          </span>
                          <span className={`showcase-badge${session.status === "Resume" ? " green" : ""}`}>
                            {session.status === "Resume" ? "Resume" : session.score}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {active === "library" && (
                  <div className="showcase-panel">
                    <div className="showcase-rows">
                      {LIBRARY_ITEMS.map(item => (
                        <div key={item.title} className="showcase-row">
                          <span className="showcase-row-icon library"><Library size={14} strokeWidth={2.8} /></span>
                          <span className="showcase-row-main">
                            <strong>{item.title}</strong>
                            <span>{item.summary}</span>
                          </span>
                          <span className="showcase-badge blue">{item.type}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>

      <div className="home-showcase-cta">
        <button className="btn btn-green" onClick={isLoggedIn ? onPractice : onSignup}>
          <Sparkles size={16} />
          {isLoggedIn ? "Start practicing" : "Unlock everything - free"}
        </button>
      </div>
    </section>
  );
}

const EXAM_CARD_ACCENTS = ["green", "blue", "purple", "orange", "red", "yellow"] as const;

function ExamCard({ exam, onClick, accent }: { exam: Exam; onClick: () => void; accent: string }) {
  return (
    <button className={`choose-exam-card accent-${accent}`} onClick={onClick}>
      <span className="choose-exam-card-top">
        <span className="choose-exam-flag">{exam.flag ?? exam.emoji}</span>
        <span className="choose-exam-category">{exam.category ?? "Medical"}</span>
      </span>
      <span className="choose-exam-title">{exam.title}</span>
      <span className="choose-exam-subtitle">
        <BookOpen size={15} strokeWidth={2.6} />
        {exam.questions.toLocaleString()} questions
      </span>
      <span className="choose-exam-cta">
        Open exam
        <ArrowRight size={16} strokeWidth={3} />
      </span>
    </button>
  );
}

function GuestAccessPrompt({
  icon: Icon,
  title,
  text,
  onSignup,
}: {
  icon: typeof User;
  title: string;
  text: string;
  onSignup: () => void;
}) {
  return (
    <div className="screen">
      <div className="guest-access-card">
        <div className="guest-access-icon">
          <Icon size={28} />
        </div>
        <h1>{title}</h1>
        <p>{text}</p>
        <button className="btn btn-green" onClick={onSignup}>
          <User size={16} />
          Sign up
        </button>
      </div>
    </div>
  );
}

/* ── Exam detail screen ───────────────────────────── */
function ExamScreen({
  exam, onPractice, onMock, onHub, onSignup, onPricing, isFree, isLoggedIn, stats, guestPrompt, onGuestPromptChange,
}: {
  exam: Exam;
  onPractice: () => void;
  onMock: () => void;
  onHub: (s: Screen) => void;
  onSignup: () => void;
  onPricing: () => void;
  isFree: boolean;
  isLoggedIn: boolean;
  stats: DashboardStats;
  guestPrompt: HubLink | null;
  onGuestPromptChange: (prompt: HubLink | null) => void;
}) {
  return (
    <div className="screen exam-landing-screen">
      <ExamHubContent
        exam={exam}
        onPractice={onPractice}
        onMock={onMock}
        onHub={onHub}
        onSignup={onSignup}
        onPricing={onPricing}
        isFree={isFree}
        isLoggedIn={isLoggedIn}
        stats={stats}
        guestPrompt={guestPrompt}
        onGuestPromptChange={onGuestPromptChange}
      />
    </div>
  );
}

const GUEST_FLOW_LABELS: Record<string, string[]> = {
  subjects: ["Subjects", "Customize", "Practice", "Results"],
  tags: ["Tags", "Customize", "View", "Results"],
  mock: ["Mock", "Settings", "Exam", "Score"],
  review: ["All", "Flagged", "Incorrect", "Correct"],
  analysis: ["Analysis", "Gaps", "Focus", "Progress"],
  sessions: ["Sessions", "Resume", "Continue", "Report"],
  notes: ["Notes", "Capture", "Review", "Recall"],
  library: ["Library", "Save", "Open", "Reuse"],
};

const SUBJECT_PREVIEW_MASTERY = [0, 0, 0, 0];

const SUBJECT_PREVIEW_QUESTION = {
  topic: "Reading",
  subtopic: "Main idea",
  stem: "Which sentence best captures the writer's main argument in the passage?",
  answers: ["A", "B", "C", "D"],
};

function GuestFeaturePreview({ link, exam }: { link: HubLink; exam: Exam }) {
  const flow = GUEST_FLOW_LABELS[link.id] ?? [link.label, "Customize", "Practice", "Results"];
  const subjectRows = exam.subjects.slice(0, 4).map((subject, index) => ({
    name: subject,
    mastery: SUBJECT_PREVIEW_MASTERY[index] ?? 0,
  }));

  return (
    <div className="guest-feature-preview" aria-label={`${link.label} product preview`}>
      <div className="guest-feature-flow" aria-label={`${link.label} sample flow`}>
        {flow.map((step, index) => (
          <span key={`${step}-${index}`}>
            <strong>{index + 1}</strong>
            {step}
          </span>
        ))}
      </div>

      {link.id === "tags" && (
        <div className="guest-feature-grid">
          <div className="showcase-panel guest-preview-surface">
            <div className="showcase-tagcloud">
              {TAG_BANK.slice(0, 14).map((tag, index) => (
                <span
                  key={tag}
                  className={`showcase-tag${index === 1 || index === 4 || index === 8 ? " active" : ""}`}
                >
                  {tag}
                </span>
              ))}
            </div>
            <p className="showcase-hint">3 tags selected - this builds a custom practice block.</p>
          </div>
          <div className="guest-customize-panel">
            <span className="showcase-badge green">Customize</span>
            <strong>Custom tag block</strong>
            <div className="guest-customize-options">
              <span>Unused questions</span>
              <span>10 questions</span>
              <span>Timer off</span>
              <span>Instant feedback</span>
            </div>
            <button type="button" className="btn btn-green btn-sm">Start block</button>
          </div>
        </div>
      )}

      {link.id === "subjects" && (
        <div className="guest-subject-preview-grid">
          <div className="guest-subject-preview-card guest-subject-preview-card-list">
            <span className="guest-preview-kicker">Subject list</span>
            <div className="guest-subject-list">
              {subjectRows.map(row => (
                <div className="guest-subject-row" key={row.name}>
                  <span className="guest-subject-row-main">
                    <strong>{row.name}</strong>
                    <span>0 questions</span>
                    <span className="guest-subject-track">
                      <span style={{ width: `${row.mastery}%` }} />
                    </span>
                  </span>
                  <span className="guest-subject-percent">{row.mastery}%</span>
                  <ChevronRight size={17} strokeWidth={3} />
                </div>
              ))}
            </div>
          </div>

          <div className="guest-subject-preview-card guest-subject-preview-card-setup">
            <span className="guest-preview-kicker">Block details</span>
            <strong>{subjectRows[0]?.name ?? "Subject"} block</strong>
            <p>Select question count, timer, and pool before starting.</p>
            <div className="guest-setup-field">8</div>
            <div className="guest-setup-options">
              <span>5</span>
              <span>10</span>
              <span>20</span>
              <span>40</span>
            </div>
            <div className="guest-setup-toggle">
              <span>
                <strong>Timer</strong>
                12 minutes
              </span>
              <span className="guest-toggle-switch" />
            </div>
            <div className="guest-status-options">
              <span className="active"><Check size={14} /> Unused</span>
              <span>Used</span>
              <span>Incorrect</span>
              <span>Flagged</span>
            </div>
          </div>

          <div className="guest-subject-preview-card guest-subject-preview-card-practice">
            <span className="guest-preview-kicker">Practice</span>
            <div className="guest-practice-shell">
              <div className="guest-practice-top">
                <span className="mobile-logo-mark">D</span>
                <span>DrNote</span>
                <X size={15} />
              </div>
              <div className="guest-practice-tags">
                <span>{SUBJECT_PREVIEW_QUESTION.subtopic}</span>
                <span>{SUBJECT_PREVIEW_QUESTION.topic}</span>
              </div>
              <strong>{SUBJECT_PREVIEW_QUESTION.stem}</strong>
              <div className="guest-practice-answers">
                {SUBJECT_PREVIEW_QUESTION.answers.map(answer => (
                  <span key={answer}>{answer}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {link.id === "mock" && (
        <div className="showcase-panel guest-preview-surface">
          <div className="showcase-mock">
            <div className="showcase-mock-head">
              <span className="showcase-mock-icon"><ClipboardCheck size={22} strokeWidth={2.5} /></span>
              <div>
                <strong>Timed mock exam</strong>
                <span>Realistic exam mode - auto-scored report</span>
              </div>
            </div>
            <div className="showcase-mock-stats">
              <span><List size={15} strokeWidth={2.8} /> 20 questions</span>
              <span><Timer size={15} strokeWidth={2.8} /> 120 minutes</span>
              <span><Trophy size={15} strokeWidth={2.8} /> Score report</span>
            </div>
            <div className="showcase-mock-bar">
              <div className="showcase-mock-fill" style={{ width: "76%" }} />
            </div>
          </div>
        </div>
      )}

      {link.id === "review" && (
        <div className="showcase-panel guest-preview-surface">
          <div className="showcase-mini-tabs">
            {REVIEW_TABS.map((tab, index) => (
              <span key={tab.value} className={`showcase-mini-pill${index === 0 ? " active" : ""}`}>
                {tab.label}
              </span>
            ))}
          </div>
          <div className="showcase-rows">
            {REVIEW_QUESTION_BANK.slice(0, 3).map(row => {
              const meta = REVIEW_STATUS_META[row.status];
              const StatusIcon = meta.Icon;
              return (
                <div key={row.id} className={`showcase-row status-${row.status}`}>
                  <span className="showcase-row-icon"><StatusIcon size={14} strokeWidth={3} /></span>
                  <span className="showcase-row-main">
                    <strong>{row.topic}</strong>
                    <span>{row.stem}</span>
                  </span>
                  <span className="showcase-row-note">{row.note}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {link.id === "analysis" && (
        <div className="showcase-panel guest-preview-surface guest-analysis-preview">
          <div className="showcase-stat-chips">
            <span className="showcase-badge green"><Target size={13} strokeWidth={2.8} /> 76% accuracy</span>
            <span className="showcase-badge orange"><Flame size={13} strokeWidth={2.8} /> 12-day streak</span>
            <span className="showcase-badge purple"><Trophy size={13} strokeWidth={2.8} /> Rank #23</span>
          </div>
          <div className="showcase-bars">
            {SHOWCASE_ANALYSIS_ROWS.map(row => (
              <div className="showcase-bar-row" key={row.topic}>
                <span className="showcase-bar-label">{row.topic}</span>
                <div className="showcase-bar-track">
                  <div
                    className="showcase-bar-fill"
                    style={{ width: `${row.mastery}%`, background: masteryColor(row.mastery).fill }}
                  />
                </div>
                <span className="showcase-bar-value">{row.mastery}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {link.id === "sessions" && (
        <div className="showcase-panel guest-preview-surface">
          <div className="showcase-rows">
            {SESSION_BANK.map(session => (
              <div key={session.name} className="showcase-row">
                <span className="showcase-row-icon session"><CalendarDays size={14} strokeWidth={2.8} /></span>
                <span className="showcase-row-main">
                  <strong>{session.name}</strong>
                  <span>{session.questions} questions - {session.date}</span>
                </span>
                <span className={`showcase-badge${session.status === "Resume" ? " green" : ""}`}>
                  {session.status === "Resume" ? "Resume" : session.score}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {link.id === "notes" && (
        <div className="showcase-panel showcase-notes guest-preview-surface">
          {NOTE_BANK.slice(0, 2).map(note => (
            <div className="showcase-note" key={note.title}>
              <div className="showcase-note-top">
                <span className="showcase-badge yellow">{note.kind}</span>
                <span className="showcase-note-review"><Clock size={12} strokeWidth={2.8} /> {note.review}</span>
              </div>
              <strong>{note.title}</strong>
              <p>{note.text}</p>
              <div className="showcase-chiprow">
                {note.tags.map(tag => <span key={tag} className="showcase-chip">{tag}</span>)}
              </div>
            </div>
          ))}
        </div>
      )}

      {link.id === "library" && (
        <div className="showcase-panel guest-preview-surface">
          <div className="showcase-rows">
            {LIBRARY_ITEMS.map(item => (
              <div key={item.title} className="showcase-row">
                <span className="showcase-row-icon library"><Library size={14} strokeWidth={2.8} /></span>
                <span className="showcase-row-main">
                  <strong>{item.title}</strong>
                  <span>{item.summary}</span>
                </span>
                <span className="showcase-badge blue">{item.type}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ExamHubContent({
  exam, onPractice, onMock, onHub, onSignup, onPricing, isFree, isLoggedIn, stats, guestPrompt, onGuestPromptChange,
}: {
  exam: Exam;
  onPractice: () => void;
  onMock: () => void;
  onHub: (s: Screen) => void;
  onSignup: () => void;
  onPricing: () => void;
  isFree: boolean;
  isLoggedIn: boolean;
  stats: DashboardStats;
  guestPrompt: HubLink | null;
  onGuestPromptChange: (prompt: HubLink | null) => void;
}) {
  if (guestPrompt) {
    const PromptIcon = guestPrompt.icon;
    return (
      <div className="exam-guest-access-wrap">
        <div className="exam-guest-access-card">
          <div className="guest-access-card exam-guest-signup-card">
            <span className="exam-guest-title-badge">{exam.title}</span>
            <div className="guest-access-icon">
              <PromptIcon size={28} />
            </div>
            <h1>Sign up to use {guestPrompt.label}</h1>
            <p>Create a free account first so DrNote can save your progress, notes, sessions, and analytics for {exam.title}.</p>
            <div className="guest-access-actions">
              <button className="btn btn-green" onClick={onSignup}>
                <User size={16} />
                Sign up
              </button>
              <button className="btn btn-outline" onClick={() => onGuestPromptChange(null)}>
                Back to exam
              </button>
            </div>
          </div>

          <GuestFeaturePreview link={guestPrompt} exam={exam} />
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Hub links */}
      <div className="hub-list">
        {hubLinks.filter(link => link.id !== "ask").map(link => {
          const Icon = link.icon;
          const locked = link.locked && isFree;
          const openLink = link.id === "mock"
            ? onMock
            : ["subjects", "tags", "review", "analysis", "sessions", "notes", "library", "ask"].includes(link.id)
              ? () => onHub(link.id as Screen)
              : onPractice;
          const handler = !isLoggedIn
            ? () => onGuestPromptChange(link)
            : locked && link.id !== "ask"
              ? onPricing
              : openLink;
          const ICON_COLORS: Record<string, string> = {
            subjects: "#58cc02", tags: "#00b8a3", mock: "#1cb0f6", review: "#ff9600",
            analysis: "#a560ff", sessions: "#ff4b4b", notes: "#ffc800",
            library: "#00b8a3", ask: "#ce82ff",
          };
          const color = ICON_COLORS[link.id] ?? "var(--green)";
          return (
            <button
              key={link.id}
              className="hub-item"
              style={{ "--hub-color": color } as CSSProperties}
              onClick={handler}
            >
              <div
                className="hub-item-icon"
              >
                <Icon size={22} />
              </div>
              <div className="hub-item-copy">
                <strong>{link.label}</strong>
                <small>{link.detail}</small>
              </div>
              {locked ? (
                <span className="badge badge-yellow"><Lock size={12} /> Pro</span>
              ) : (
                <span className="badge hub-item-badge">{hubCountFor(link.id, stats)}</span>
              )}
            </button>
          );
        })}
      </div>

    </>
  );
}

function SubjectsScreen({
  exam, subjects, onStart,
}: {
  exam: Exam;
  subjects: TopicMasteryRow[];
  onStart: (title: string) => void;
}) {
  const displaySubjects = subjects.length ? subjects : exam.subjects.map(topic => ({
    topic,
    mastery: 0,
    answered: 0,
    total: 0,
  }));

  return (
    <div className="screen subject-screen">
      <div className="list-grid subject-list-grid">
        {displaySubjects.map(subject => {
          const progress = Math.max(0, Math.min(100, subject.mastery));
          const color = masteryColor(progress);
          return (
            <button key={subject.topic} className="drill-row subject-drill-row" onClick={() => onStart(subject.topic)}>
              <div className="drill-main">
                <strong>{subject.topic}</strong>
                <small>{subject.total} questions</small>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${progress}%`, background: color.fill }} />
                </div>
              </div>
              <span className={`badge ${color.badge}`}>{progress}%</span>
              <ChevronRight size={18} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TagsScreen({
  exam, onBack, onStart, tagStatusCounts, questionStatus,
}: {
  exam: Exam;
  onBack: () => void;
  onStart: (title: string) => void;
  tagStatusCounts: TagPoolStatusCount[];
  questionStatus: QuestionStatus;
}) {
  const [query, setQuery] = useState("");
  const tagCountBySlug = useMemo(() => {
    const counts = new Map<string, TagPoolStatusCount>();
    for (const item of tagStatusCounts) {
      counts.set(item.tag.toLowerCase(), item);
    }
    return counts;
  }, [tagStatusCounts]);

  const tags = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? TAG_BANK.filter(tag => tag.toLowerCase().includes(q)) : TAG_BANK;
  }, [query]);

  const tagCount = (tag: string) => {
    const bucket = tagCountBySlug.get(tag.toLowerCase());
    if (!bucket) {
      return 0;
    }
    if (questionStatus === "used") return bucket.used;
    if (questionStatus === "incorrect") return bucket.incorrect;
    if (questionStatus === "flagged") return bucket.flagged;
    return bucket.unused;
  };
  return (
    <div className="screen">
      <div className="search-bar">
        <Search size={19} />
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Filter tags — topic, recall, weak..." />
        {query && <button className="icon-clear" onClick={() => setQuery("")} aria-label="Clear tag search"><X size={16} /></button>}
      </div>
      <div className="tag-cloud">
        {tags.map((tag) => (
          <button key={tag} className="tag-chip" onClick={() => onStart(tag)}>
            <span>{tag}</span>
            <small>{tagCount(tag)}</small>
          </button>
        ))}
      </div>
    </div>
  );
}

function ReviewScreen({
  exam, onBack, onStart, stats, reviewRows,
}: {
  exam: Exam;
  onBack: () => void;
  onStart: (title: string) => void;
  stats: DashboardStats;
  reviewRows: Array<{
    _id: string;
    status: Exclude<ReviewFilter, "all"> | "unanswered";
    note?: string;
    question?: {
      subject: string;
      topic: string;
      prompt: string;
    } | null;
  }>;
}) {
  const [filter, setFilter] = useState<ReviewFilter>("all");
  const [query, setQuery] = useState("");
  const counts: Record<ReviewFilter, number> = {
    all: stats.reviewCount,
    flagged: stats.flaggedCount,
    incorrect: stats.incorrectCount,
    correct: stats.correctCount,
  };
  const reviewItems = reviewRows
    .filter(item => item.status !== "unanswered")
    .map(item => {
      const prompt = item.question?.prompt?.trim();
      const topic = item.question?.topic?.trim() || item.question?.subject?.trim() || "Saved review";
      return {
        id: item._id,
        status: item.status as Exclude<ReviewFilter, "all">,
        topic,
        stem: prompt || item.note || topic,
        note: item.note ?? topic,
      };
    });
  const filteredQuestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    return reviewItems.filter(item => {
      const matchesFilter = filter === "all" || item.status === filter;
      const matchesQuery = !q || [item.stem, item.topic, item.note, item.status].some(value => value.toLowerCase().includes(q));
      return matchesFilter && matchesQuery;
    });
  }, [filter, query, reviewItems]);
  return (
    <div className="screen review-screen">
      <div className="segmented review-tabs" role="tablist" aria-label="Review question filters">
        {REVIEW_TABS.map(tab => (
          <button
            key={tab.value}
            className={filter === tab.value ? "active" : ""}
            onClick={() => setFilter(tab.value)}
            role="tab"
            aria-selected={filter === tab.value}
            type="button"
          >
            <span>{tab.label}</span>
            <small>{counts[tab.value]}</small>
          </button>
        ))}
      </div>
      <div className="review-list-panel">
        <div className="review-list-toolbar">
          <div>
            <strong>{stats.reviewCount} questions</strong>
            <span>{filteredQuestions.length} shown</span>
          </div>
          <div className="review-search">
            <Search size={17} />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search questions"
              aria-label="Search review questions"
            />
            {query && <button className="icon-clear" onClick={() => setQuery("")} aria-label="Clear review search"><X size={15} /></button>}
          </div>
        </div>
        <div className="review-question-list">
          {filteredQuestions.map(item => {
            const StatusIcon = REVIEW_STATUS_META[item.status].Icon;
            return (
              <button
                key={item.id}
                className="review-question-row"
                onClick={() => onStart(`${item.topic} review`)}
              >
                <span className={`review-status-icon ${item.status}`} aria-hidden="true">
                  <StatusIcon size={20} />
                </span>
                <span className="review-question-stem">{item.stem}</span>
                <span className="review-question-topic">{item.topic}</span>
                <span className={`review-status-pill ${item.status}`}>{REVIEW_STATUS_META[item.status].label}</span>
                <ChevronRight size={22} />
              </button>
            );
          })}
          {filteredQuestions.length === 0 && (
            <div className="review-empty-state">
              <Search size={22} />
              <strong>No questions match</strong>
              <span>Try a different search or tab.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AnalysisScreen({
  exam,
  onBack,
  stats,
  topicMastery,
}: {
  exam: Exam;
  onBack: () => void;
  stats: DashboardStats;
  topicMastery: TopicMasteryRow[];
}) {
  void onBack;
  const rows = [
    { label: "Accuracy", value: `${stats.accuracy}%`, icon: Target },
    { label: "Questions", value: String(stats.questionsAnswered), icon: ClipboardCheck },
    { label: "Streak", value: String(stats.streak), icon: Timer },
    { label: "Flagged", value: String(stats.flaggedCount), icon: Flag },
  ];
  const gaps = topicMastery.length ? topicMastery : [{ topic: exam.title, mastery: 0, answered: 0, total: stats.subjectCount }];
  return (
    <div className="screen analysis-screen">
      <div className="stat-grid">
        {rows.map(r => (
          <div className="stat-card" key={r.label}>
            <r.icon size={22} />
            <div className="stat-card-val">{r.value}</div>
            <div className="stat-card-label">{r.label}</div>
          </div>
        ))}
      </div>
      <div className="analysis-panel">
        <h2>Topic gaps</h2>
        {gaps.slice(0, 8).map(s => (
          <div className={`mastery-row gap-level-${gapLevel(s.mastery)}`} key={s.topic}>
            <div className="mastery-row-header">
              <span>{s.topic}</span>
              <span>{s.mastery}% · {s.answered}/{s.total}</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill analysis-progress-fill" style={{ width: `${s.mastery}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SessionsScreen({
  exam, onBack, onResume, onReport, sessions,
}: {
  exam: Exam;
  onBack: () => void;
  onResume: (title: string) => void;
  onReport: (session: {
    title: string;
    source?: string;
    mode: QuizMode;
    totalQuestions: number;
    answered: number;
    correct: number;
    flagged: number;
    startedAt: number;
    completedAt?: number;
    updatedAt: number;
  }) => void;
  sessions: Array<{
    _id: string;
    title: string;
    source?: string;
    mode: QuizMode;
    status: "active" | "completed" | "abandoned";
    totalQuestions: number;
    answered: number;
    correct: number;
    flagged: number;
    startedAt: number;
    completedAt?: number;
    updatedAt: number;
  }>;
}) {
  void exam;
  void onBack;
  const visibleSessions = sessions.filter(session => session.answered > 0);
  return (
    <div className="screen">
      <div className="list-grid">
        {visibleSessions.map(session => {
          const isActive = session.status === "active";
          const score = isActive
            ? `${session.answered}/${session.totalQuestions}`
            : `${Math.round((session.correct / Math.max(1, session.answered)) * 100)}%`;
          const details = [
            session.source && session.source !== session.title ? session.source : null,
            `${session.totalQuestions} questions`,
            formatStoredDate(session.startedAt),
          ].filter(Boolean).join(" · ");
          return (
          <div key={session._id} className="session-row">
            <div className="drill-main">
              <strong>{session.title}</strong>
              <small>{details}</small>
            </div>
            <div className={`session-score${isActive ? " pending" : ""}`}>
              <strong>{score}</strong>
              <span>{isActive ? "Progress" : "Score"}</span>
            </div>
            <div className="session-actions">
              <button className="btn btn-outline btn-sm" onClick={() => onResume(session.title)}>
                {session.status === "active" ? "Resume" : "Restart"}
              </button>
              <button className="btn btn-blue btn-sm" onClick={() => onReport(session)}>
                Report
              </button>
            </div>
          </div>
          );
        })}
        {visibleSessions.length === 0 && (
          <div className="review-empty-state">
            <Timer size={22} />
            <strong>No saved sessions yet</strong>
            <span>Start a practice block to create one.</span>
          </div>
        )}
      </div>
    </div>
  );
}

function NotesScreen({
  exam,
  onBack,
  notes,
}: {
  exam: Exam;
  onBack: () => void;
  notes: Array<{
    _id: string;
    title: string;
    kind: string;
    category: string;
    text: string;
    tags: string[];
    bookmarked: boolean;
  }>;
}) {
  void exam;
  void onBack;
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "bite" | "hy" | "images">("all");
  const [bookmarkedNotes, setBookmarkedNotes] = useState<string[]>([]);
  const filteredNotes = useMemo(() => {
    const q = query.trim().toLowerCase();
    return notes.filter(note => {
      const matchesFilter =
        filter === "all" ||
        (filter === "bite" && note.kind.toLowerCase().includes("bite")) ||
        (filter === "hy" && note.kind.toLowerCase().includes("hy")) ||
        (filter === "images" && note.tags.some(tag => tag.toLowerCase().includes("image")));
      const matchesQuery =
        !q ||
        [note.title, note.kind, note.category, note.text, ...note.tags]
          .some(value => value.toLowerCase().includes(q));
      return matchesFilter && matchesQuery;
    });
  }, [filter, notes, query]);
  const filters = [
    { id: "all" as const, label: "All" },
    { id: "bite" as const, label: "Bite size" },
    { id: "hy" as const, label: "HY" },
    { id: "images" as const, label: "Images" },
  ];

  return (
    <div className="screen">
      <div className="notes-toolbar">
        <div className="notes-search">
          <Search size={20} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search notes..."
            aria-label="Search notes"
          />
          {query && <button className="icon-clear" onClick={() => setQuery("")} aria-label="Clear note search"><X size={16} /></button>}
        </div>
        <div className="notes-filter" aria-label="Filter notes">
          {filters.map(item => (
            <button
              key={item.id}
              className={filter === item.id ? "active" : ""}
              onClick={() => setFilter(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="notes-workspace">
        <div className="notes-list-panel">
          <div className="notes-list-summary">
            <strong>{filteredNotes.length} notes</strong>
            <span>{notes.filter(note => note.tags.some(tag => tag.toLowerCase().includes("image"))).length} with images</span>
          </div>
          <div className="notes-grid">
            {filteredNotes.map((note, index) => (
              <article
                key={note._id}
                className="note-card"
              >
                <div className="note-avatar" aria-label={`Note ${index + 1}`}>
                  {index + 1}
                </div>
                <div className="note-content">
                  <div className="note-row-head">
                    <h2>{note.title}</h2>
                  </div>
                  <p>{note.text}</p>
                  <div className="note-meta">
                    <span>{note.category}</span>
                  </div>
                </div>
                <button
                  className={`note-bookmark-btn${bookmarkedNotes.includes(note.title) ? " active" : ""}`}
                  onClick={() => {
                    setBookmarkedNotes(current =>
                      current.includes(note.title)
                        ? current.filter(title => title !== note.title)
                        : [...current, note.title]
                    );
                  }}
                  aria-label={`${bookmarkedNotes.includes(note.title) ? "Remove bookmark from" : "Bookmark"} ${note.title}`}
                  aria-pressed={bookmarkedNotes.includes(note.title)}
                >
                  <Bookmark size={28} fill={bookmarkedNotes.includes(note.title) ? "currentColor" : "none"} />
                </button>
              </article>
            ))}
            {filteredNotes.length === 0 && (
              <div className="review-empty-state">
                <Search size={22} />
                <span>No notes match this search.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function LibraryScreen({
  exam,
  onBack,
  libraryItems,
}: {
  exam: Exam;
  onBack: () => void;
  libraryItems: Array<{
    _id: string;
    type: string;
    title: string;
    summary: string;
    tags: string[];
    sections: Array<{ heading: string; body: string }>;
    createdAt: number;
  }>;
}) {
  void exam;
  void onBack;
  const [query, setQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<LibraryItem | null>(null);
  const detailSectionLabels = ["Summary", "Definition", "Clinical notes"];
  const items = useMemo<LibraryItem[]>(() => libraryItems.map(item => ({
    title: item.title,
    type: item.type,
    saved: formatStoredDate(item.createdAt),
    summary: item.summary,
    sections: item.sections,
    tags: item.tags,
  })), [libraryItems]);
  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q
      ? items.filter(item => [item.title, item.type, item.saved, ...item.tags].some(value => value.toLowerCase().includes(q)))
      : items;
  }, [items, query]);

  if (selectedItem) {
    return (
      <div className="screen">
        <button className="back-btn" onClick={() => setSelectedItem(null)}>
          <ChevronLeft size={18} /> Library
        </button>
        <article className="library-detail">
          <div className="library-detail-head">
            <div>
              <span className="badge badge-teal">{selectedItem.type}</span>
              <h1>{selectedItem.title}</h1>
              <p>{selectedItem.summary}</p>
            </div>
          </div>
          <div className="library-detail-sections">
            {selectedItem.sections.map((section, index) => (
              <section key={section.heading} className="library-detail-section">
                <h2>{detailSectionLabels[index] ?? "Note"}</h2>
                <p>{section.body}</p>
              </section>
            ))}
          </div>
        </article>
      </div>
    );
  }

  return (
    <div className="screen">
      <div className="search-bar">
        <Search size={19} />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search library"
          aria-label="Search library"
        />
        {query && <button className="icon-clear" onClick={() => setQuery("")} aria-label="Clear library search"><X size={16} /></button>}
      </div>
      <div className="list-grid">
        {filteredItems.map(item => (
          <button
            key={item.title}
            className="session-row library-row"
            onClick={() => setSelectedItem(item)}
          >
            <div className="drill-main">
              <strong>{item.title}</strong>
              <small>{item.type} · saved {item.saved}</small>
            </div>
            <ChevronRight size={18} />
          </button>
        ))}
        {filteredItems.length === 0 && (
          <div className="review-empty-state">
            <Search size={22} />
            <span>No library items match this search.</span>
          </div>
        )}
      </div>
    </div>
  );
}

function AssistantFloatingModal({
  exam, askHistory, askInput, setAskInput, sendAsk,
}: {
  exam: Exam;
  askHistory: { role: string; text: string }[];
  askInput: string;
  setAskInput: (v: string) => void;
  sendAsk: (e: FormEvent) => void;
}) {
  const assistantHash = "#ask-drnote-assistant";
  const promptStarters = [
    "Explain my weakest topic",
    "Make a 10-question review plan",
    "Compare confusing answer choices",
  ];
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const syncOpenState = () => {
      const shouldOpen = window.location.hash === assistantHash;
      setIsOpen(shouldOpen);
      if (!shouldOpen) {
        setIsExpanded(false);
      }
    };

    syncOpenState();
    window.addEventListener("hashchange", syncOpenState);
    window.addEventListener("popstate", syncOpenState);
    return () => {
      window.removeEventListener("hashchange", syncOpenState);
      window.removeEventListener("popstate", syncOpenState);
    };
  }, []);

  const clearAssistantHash = () => {
    if (window.location.hash === assistantHash) {
      window.history.pushState(null, "", `${window.location.pathname}${window.location.search}`);
    }
  };

  const openAssistant = () => {
    if (window.location.hash !== assistantHash) {
      window.history.pushState(null, "", assistantHash);
    }
    setIsOpen(true);
  };

  const closeAssistant = () => {
    clearAssistantHash();
    setIsOpen(false);
    setIsExpanded(false);
  };

  const toggleAssistant = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (isOpen) {
      closeAssistant();
      return;
    }
    openAssistant();
  };

  return (
    <div className="assistant-modal-root">
      <a
        href="#ask-drnote-assistant"
        className="assistant-modal-trigger"
        aria-label={isOpen ? "Close Ask DrNote assistant" : "Open Ask DrNote assistant"}
        aria-expanded={isOpen}
        onClick={toggleAssistant}
      >
        <span className="assistant-modal-logo-mark" aria-hidden="true">D</span>
        <span className="assistant-modal-pulse" aria-hidden="true" />
        <span className="sr-only">{isOpen ? "Close Ask DrNote assistant" : "Open Ask DrNote assistant"}</span>
      </a>

      <div
        id="ask-drnote-assistant"
        className={`assistant-modal-content${isOpen ? " is-open" : ""}${isExpanded ? " is-fullscreen" : ""}`}
        role="dialog"
        aria-label="Ask DrNote assistant"
      >
        <div className="assistant-thread">
          <header className="assistant-thread-header">
            <div className="assistant-thread-title">
              <span className="assistant-thread-mark">D</span>
              <div>
                <strong>Ask DrNote</strong>
                <span>{exam.title} tutor</span>
              </div>
            </div>
            <div className="assistant-thread-actions">
              <button
                type="button"
                className="assistant-thread-action"
                aria-label={isExpanded ? "Exit fullscreen assistant" : "Open fullscreen assistant"}
                aria-pressed={isExpanded}
                onClick={() => setIsExpanded(current => !current)}
              >
                {isExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
              </button>
              <a
                href="#"
                className="assistant-thread-action assistant-thread-close"
                aria-label="Close assistant"
                onClick={(e) => {
                  e.preventDefault();
                  closeAssistant();
                }}
              >
                <X size={18} />
              </a>
            </div>
          </header>

          <div className="assistant-suggestions" aria-label="Prompt starters">
            {promptStarters.map(prompt => (
              <button key={prompt} onClick={() => setAskInput(prompt)}>
                <Sparkles size={14} />
                <span>{prompt}</span>
              </button>
            ))}
          </div>

          <div className="assistant-thread-messages">
            {askHistory.map((msg, i) => (
              <div key={i} className={`ask-bubble ${msg.role === "You" ? "you" : ""}`}>
                <strong>{msg.role}</strong>
                <span>{msg.text}</span>
              </div>
            ))}
          </div>

          <form className="assistant-composer" onSubmit={sendAsk}>
            <input
              value={askInput}
              onChange={e => setAskInput(e.target.value)}
              placeholder="Ask DrNote..."
              aria-label="Ask DrNote"
            />
            <button aria-label="Send message">
              <Send size={17} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function AskScreen({
  exam, onBack, askHistory, askInput, setAskInput, sendAsk,
}: {
  exam: Exam;
  onBack: () => void;
  askHistory: { role: string; text: string }[];
  askInput: string;
  setAskInput: (v: string) => void;
  sendAsk: (e: FormEvent) => void;
}) {
  const promptStarters = [
    "Explain my weakest topic in simple steps",
    "Make a 10-question review plan",
    "Compare the confusing answer choices",
    "Give me high-yield facts for this exam",
  ];

  return (
    <div className="screen ask-screen">
      <div className="ask-layout">
        <aside className="ask-panel">
          <h1>Ask DrNote</h1>
          <p>{exam.title} tutor with saved explanations, review plans, and answer-choice breakdowns.</p>

          <div className="ask-prompt-list">
            {promptStarters.map(prompt => (
              <button key={prompt} onClick={() => setAskInput(prompt)}>
                <Sparkles size={15} />
                <span>{prompt}</span>
              </button>
            ))}
          </div>
        </aside>

        <section className="ask-chat">
          <div className="ask-chat-header">
            <div>
              <strong>Saved tutor thread</strong>
              <span>{askHistory.length} message{askHistory.length === 1 ? "" : "s"}</span>
            </div>
            <span className="badge badge-purple">{exam.title}</span>
          </div>

          <div className="ask-messages">
            {askHistory.map((msg, i) => (
              <div key={i} className={`ask-bubble ${msg.role === "You" ? "you" : ""}`}>
                <strong>{msg.role}</strong>
                <span>{msg.text}</span>
              </div>
            ))}
          </div>

          <form className="ask-form" onSubmit={sendAsk}>
            <input
              className="field-input"
              value={askInput}
              onChange={e => setAskInput(e.target.value)}
              placeholder="Ask about a topic, answer choice, or study plan..."
            />
            <button className="btn btn-green" aria-label="Send message">
              <Send size={17} />
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

function ReportScreen({
  report, onBack, onRestart,
}: {
  report: ReportState;
  onBack: () => void;
  onRestart: () => void;
}) {
  const answered = report.answered ?? report.total;
  const unanswered = report.unanswered ?? Math.max(0, report.total - answered);
  const flagged = report.flagged ?? 0;
  const incorrect = Math.max(0, answered - report.correct);
  const pacing = Math.max(0.1, Math.round((report.minutes / Math.max(1, answered)) * 10) / 10);
  const completion = Math.round((answered / Math.max(1, report.total)) * 100);
  const accuracyAnswered = answered ? Math.round((report.correct / answered) * 100) : 0;
  const passingGap = Math.max(0, 65 - report.score);
  const subjectBreakdown = report.subjectBreakdown?.length ? report.subjectBreakdown : [{
    name: report.mode === "mock" ? "Overall exam" : report.source,
    correct: report.correct,
    incorrect,
    unanswered,
    flagged,
    total: report.total,
  }];
  const reviewItems = report.reviewItems ?? [];
  const weakestSubjects = [...subjectBreakdown]
    .sort((a, b) => {
      const aAccuracy = a.correct / Math.max(1, a.total);
      const bAccuracy = b.correct / Math.max(1, b.total);
      return aAccuracy - bAccuracy || b.flagged - a.flagged;
    })
    .slice(0, 3);
  const scoreBand = report.score >= 75 ? "Ready" : report.score >= 60 ? "Borderline" : "Needs work";
  const scoreBadge = report.score >= 75 ? "badge-green" : report.score >= 60 ? "badge-yellow" : "badge-red";
  const metricRows: Array<[string, string, string, typeof CheckCircle2]> = [
    ["Score", `${report.score}%`, `${report.correct}/${report.total} correct`, Target],
    ["Accuracy", `${accuracyAnswered}%`, "of answered questions", CheckCircle2],
    ["Completion", `${completion}%`, `${answered}/${report.total} answered`, ClipboardCheck],
    ["Pacing", `${pacing}m/q`, `${report.minutes} min used`, Timer],
    ["Incorrect", `${incorrect}`, "review first", AlertTriangle],
    ["Flagged", `${flagged}`, "marked during exam", Flag],
  ];
  return (
    <div className="screen report-screen">
      <section className={`score-report ${report.mode === "mock" ? "mock" : ""}`}>
        <div className="score-report-main">
          <div>
            <div className="report-kicker">
              <span className="badge badge-blue">{report.mode === "mock" ? "Mock exam report" : "Practice report"}</span>
              <span className={`badge ${scoreBadge}`}>{scoreBand}</span>
            </div>
            <h1>{report.title}</h1>
            <p>{report.source}</p>
            <div className="report-summary-line">
              <span><ClipboardCheck size={16} /> {answered}/{report.total} answered</span>
              <span><AlertTriangle size={16} /> {unanswered} missing</span>
              <span><Clock size={16} /> {report.minutes} minutes</span>
            </div>
          </div>
          <div className="score-ring" aria-label={`Score ${report.score}%`}>
            <svg viewBox="0 0 120 120" role="presentation">
              <circle cx="60" cy="60" r="52" />
              <circle cx="60" cy="60" r="52" style={{ strokeDashoffset: 327 - (327 * report.score) / 100 }} />
            </svg>
            <div>
              <span>Score</span>
              <strong>{report.score}%</strong>
              <em>{report.correct}/{report.total}</em>
            </div>
          </div>
        </div>
        <div className="report-score-note">
          {report.score >= 75
            ? "Performance is above the readiness target. Keep reviewing misses and repeat a timed block to confirm consistency."
            : passingGap > 0
              ? `You are ${passingGap} points below the 65% readiness target. Prioritize weak subjects before the next mock.`
              : "You are near the readiness target. Clean up incorrect and flagged questions before increasing block length."}
        </div>
      </section>

      <section className="report-metric-grid" aria-label="Exam score details">
        {metricRows.map(([label, value, detail, Icon]) => (
          <div className="report-metric-card" key={label}>
            <span><Icon size={17} /></span>
            <strong>{value}</strong>
            <small>{label}</small>
            <em>{detail}</em>
          </div>
        ))}
      </section>

      <section className="report-two-column">
        <div className="card report-panel">
          <div className="title-row">
            <h2>Subject Performance</h2>
            <span>{subjectBreakdown.length} subjects</span>
          </div>
          <div className="subject-score-list">
            {subjectBreakdown.map(subject => {
              const percent = Math.round((subject.correct / Math.max(1, subject.total)) * 100);
              const missed = subject.incorrect + subject.unanswered;
              const band = percent >= 75 ? "strong" : percent >= 60 ? "borderline" : "weak";
              return (
                <div className="subject-score-row" key={subject.name}>
                  <div>
                    <strong>{subject.name}</strong>
                    <span>{subject.correct}/{subject.total} correct · {missed} miss{missed === 1 ? "" : "es"} · {subject.flagged} flagged</span>
                  </div>
                  <div className="subject-score-track" aria-label={`${subject.name} ${percent}%`}>
                    <span className={band} style={{ width: `${percent}%` }} />
                  </div>
                  <em className={band}>{percent}%</em>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card report-panel">
          <div className="title-row">
            <h2>Weak Areas</h2>
            <span>Next block</span>
          </div>
          <div className="weak-topic-list">
            {weakestSubjects.map(subject => {
              const percent = Math.round((subject.correct / Math.max(1, subject.total)) * 100);
              return (
                <div key={subject.name}>
                  <span className={percent >= 60 ? "badge badge-yellow" : "badge badge-red"}>{percent}%</span>
                  <strong>{subject.name}</strong>
                  <small>{subject.incorrect + subject.unanswered} missed, {subject.flagged} flagged</small>
                </div>
              );
            })}
          </div>
          <div className="report-plan-box">
            <strong>Recommended review order</strong>
            <p>
              Review incorrect explanations first, clear flagged questions, then run a 10-question timed block from the weakest subject above.
            </p>
          <div>
            <span>{incorrect} incorrect</span>
            <span>{flagged} flagged</span>
            <span>{unanswered} missing</span>
          </div>
        </div>
      </div>
      </section>

      <section className="card report-panel report-review-panel">
        <div className="title-row">
          <h2>Question Review Queue</h2>
          <span>{reviewItems.length} priority items</span>
        </div>
        <div className="report-review-table">
          {reviewItems.length > 0 ? reviewItems.slice(0, 8).map(item => (
            <div className="report-review-row" key={`${item.number}-${item.status}`}>
              <strong>Q{item.number}</strong>
              <span className={`badge ${item.status === "incorrect" ? "badge-red" : item.status === "flagged" ? "badge-yellow" : "badge-gray"}`}>
                {item.status}
              </span>
              <div>
                <b>{item.subject}</b>
                <p>{item.stem}</p>
              </div>
            </div>
          )) : (
            <div className="report-empty-review">
              <CheckCircle2 size={20} />
              No priority review items from this attempt.
            </div>
          )}
        </div>
        <div className="report-actions">
          <button className="btn btn-green" onClick={onRestart}><RotateCcw size={17} /> Restart</button>
          <button className="btn btn-outline" onClick={onBack}>Done</button>
        </div>
      </section>
    </div>
  );
}
/* ── Practice / Quiz screen ───────────────────────── */
type PracticeScreenProps = {
  exam: Exam;
  title: string;
  mode: QuizMode;
  totalQ: number;
  timerOn: boolean;
  timerMinutes: number;
  selectedChoice: string;
  setSelectedChoice: (v: string) => void;
  bookmarked: boolean;
  setBookmarked: (v: boolean) => void;
  commentsByContent: Record<string, ContentComment[]>;
  addContentComment: (contentKey: string, text: string) => void;
  chatOpen: boolean;
  setChatOpen: (v: boolean) => void;
  chatHistory: { role: string; text: string }[];
  chatInput: string;
  setChatInput: (v: string) => void;
  sendChat: (e: FormEvent) => void;
  onLimit: () => void;
  onPricing: () => void;
  onNext: () => Promise<boolean> | boolean;
  onExit: () => void;
  onComplete: (correct: number, total: number, mode: QuizMode, summary?: QuizSummary) => void;
  isFree: boolean;
  canUseAi: boolean;
  isSignedIn: boolean;
  remaining: number;
  convexQuestions: Array<{
    _id: Id<"questions">;
    subject: string;
    topic: string;
    subtopic?: string;
    options: { id: string; label: string }[];
    correctOptionId: string;
    prompt: string;
    explanation: string;
    objective: string;
  }>;
};

function PracticeScreen(props: PracticeScreenProps) {
  if (props.mode === "mock") {
    return (
      <MockExamRunner
        exam={props.exam}
        title={props.title}
        totalQ={props.totalQ}
        timerOn={props.timerOn}
        timerMinutes={props.timerMinutes}
        onExit={props.onExit}
        onComplete={props.onComplete}
      />
    );
  }

  return <StandardPracticeScreen {...props} />;
}

function StandardPracticeScreen({
  exam, title, mode, totalQ, setSelectedChoice, commentsByContent, addContentComment,
  onLimit, onPricing, onNext, onExit, onComplete, isFree, canUseAi, isSignedIn, remaining, convexQuestions,
}: PracticeScreenProps) {
  const startRemoteSession = useMutation(api.practice.startSession);
  const recordRemoteAnswer = useMutation(api.practice.recordAnswer);
  const finishRemoteSession = useMutation(api.practice.finishSession);
  const upsertReview = useMutation(api.reviews.upsert);
  const addRemoteComment = useMutation(api.feedback.addComment);
  const rateRemoteQuestion = useMutation(api.feedback.rateQuestion);
  const reportRemoteQuestion = useMutation(api.feedback.reportQuestion);
  const createQuestionAiThread = useMutation(api.ai.getOrCreateThread);
  const appendAiMessage = useMutation(api.ai.addMessage);
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [ratings, setRatings] = useState<Record<number, number>>({});
  const [flagged, setFlagged] = useState<Record<number, boolean>>({});
  const [remoteSessionId, setRemoteSessionId] = useState<Id<"sessions"> | null>(null);
  const remoteSessionIdRef = useRef<Id<"sessions"> | null>(null);
  const startingSessionRef = useRef<Promise<Id<"sessions">> | null>(null);
  const [drawer, setDrawer] = useState<null | "comments" | "rate" | "report" | "ask">(null);
  const [showExit, setShowExit] = useState(false);
  const [toast, setToast] = useState("");
  const [reportReason, setReportReason] = useState<string | null>(null);
  const [reportDone, setReportDone] = useState(false);
  const [aiInput, setAiInput] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [commentDraft, setCommentDraft] = useState("");
  const [isAnswering, setIsAnswering] = useState(false);
  const questionAiThreads = useRef<Record<number, Id<"aiThreads">>>({});
  const canAsk = isSignedIn && canUseAi;

  const practiceQuestions = useMemo(
    () => convexQuestions.length ? convexQuestions.map(convexQuestionToPracticeQuestion) : PRACTICE_QUESTIONS,
    [convexQuestions]
  );
  const activeQuestion = practiceQuestions[qIndex % practiceQuestions.length];
  const activeCommentKey = commentKeyForQuestion(exam.id, qIndex, activeQuestion.prompt);
  const remoteComments = useQuery(api.feedback.commentsForQuestion, { questionKey: activeCommentKey });
  const activeComments = remoteComments?.map(comment => ({
    id: comment._id,
    text: comment.text,
    createdAt: formatStoredDate(comment.createdAt),
  })) ?? commentsByContent[activeCommentKey] ?? [];
  const storedCommentCount = Math.max(activeQuestion.comments, activeComments.length);
  const selected = answers[qIndex] ?? null;
  const answered = selected !== null;
  const isCorrect = selected === activeQuestion.correct;
  const answeredCount = Object.keys(answers).length;
  const correctCount = Object.entries(answers).reduce((sum, [key, value]) => {
    const q = practiceQuestions[Number(key) % practiceQuestions.length];
    return value === q.correct ? sum + 1 : sum;
  }, 0);
  const progress = (answeredCount / totalQ) * 100;
  const isLastQuestion = qIndex + 1 >= totalQ;
  const unansweredCount = Math.max(0, totalQ - answeredCount);
  const correctLabel = activeQuestion.options.find(option => option.id === activeQuestion.correct)?.label ?? "";
  const wrongChoices = activeQuestion.options.filter(option => option.id !== activeQuestion.correct && activeQuestion.why[option.id]);
  const rating = ratings[qIndex] || 0;

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(""), 1800);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  async function choosePracticeAnswer(id: string) {
    if (isAnswering || answered) return;
    if (isFree && remaining <= 0) {
      onLimit();
      return;
    }
    setIsAnswering(true);
    try {
      const canAdvance = await onNext();
      if (!canAdvance) return;
      setAnswers(current => ({ ...current, [qIndex]: id }));
      setSelectedChoice(activeQuestion.options.find(option => option.id === id)?.label ?? "");
      if (activeQuestion.questionId) {
        const correct = id === activeQuestion.correct;
        void (async () => {
          const sessionId = await ensureRemoteSession();
          await recordRemoteAnswer({
            sessionId: sessionId ?? undefined,
            questionId: activeQuestion.questionId!,
            selectedOptionId: id,
            correct,
          });
        })().catch(() => {
          setToast("Saved this answer locally. Server sync is delayed.");
        });
        void upsertReview({
          questionId: activeQuestion.questionId,
          status: correct ? "correct" : "incorrect",
        }).catch(() => {
          setToast("Review sync is delayed.");
        });
      }
    } finally {
      setIsAnswering(false);
    }
  }

  async function ensureRemoteSession() {
    if (!isSignedIn) return null;
    if (remoteSessionIdRef.current) return remoteSessionIdRef.current;
    if (!startingSessionRef.current) {
      startingSessionRef.current = startRemoteSession({
        examId: exam.id,
        title,
        mode: "practice",
        source: title,
        totalQuestions: totalQ,
      }).then(sessionId => {
        remoteSessionIdRef.current = sessionId;
        setRemoteSessionId(sessionId);
        return sessionId;
      });
    }
    try {
      return await startingSessionRef.current;
    } finally {
      startingSessionRef.current = null;
    }
  }

  function closeDrawer() {
    setDrawer(null);
  }

  function openDrawer(name: "comments" | "rate" | "report" | "ask") {
    setDrawer(name);
    if (name === "report") {
      setReportReason(null);
      setReportDone(false);
    }
    if (name === "ask") {
      setAiAnswer("");
      setAiError("");
      setAiInput("");
    }
  }

  function go(direction: -1 | 1) {
    const nextIndex = qIndex + direction;
    if (nextIndex < 0) return;
    if (nextIndex >= totalQ) {
      finishPractice();
      return;
    }
    if (direction > 0 && isFree && remaining <= 0) {
      onLimit();
      return;
    }
    setQIndex(nextIndex);
    setSelectedChoice("");
    setCommentDraft("");
    closeDrawer();
  }

  useEffect(() => {
    function isEditableTarget(target: EventTarget | null) {
      if (!(target instanceof HTMLElement)) return false;
      const tagName = target.tagName.toLowerCase();
      return tagName === "input" || tagName === "textarea" || tagName === "select" || target.isContentEditable;
    }

    function handleQuestionNavigation(event: KeyboardEvent) {
      if (drawer || showExit || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      if (isEditableTarget(event.target)) return;
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;

      event.preventDefault();
      go(event.key === "ArrowRight" ? 1 : -1);
    }

    window.addEventListener("keydown", handleQuestionNavigation);
    return () => window.removeEventListener("keydown", handleQuestionNavigation);
  }, [drawer, showExit, qIndex, totalQ, isFree, remaining]);

  function finishPractice() {
    const sessionId = remoteSessionIdRef.current ?? remoteSessionId;
    if (sessionId) {
      void finishRemoteSession({
        sessionId,
        flagged: Object.values(flagged).filter(Boolean).length,
      }).catch(() => {});
    }
    onComplete(correctCount, totalQ, mode, {
      answered: answeredCount,
      unanswered: unansweredCount,
    });
  }

  function optionClass(id: string) {
    if (!answered) return "dr-choice";
    if (id === activeQuestion.correct) return "dr-choice correct";
    if (id === selected) return "dr-choice wrong";
    return "dr-choice dim";
  }

  function submitQuestionComment(e: FormEvent) {
    e.preventDefault();
    const t = commentDraft.trim();
    if (!t) return;
    addContentComment(activeCommentKey, t);
    void addRemoteComment({
      questionKey: activeCommentKey,
      questionId: activeQuestion.questionId,
      text: t,
    }).catch(() => {});
    setCommentDraft("");
  }

  async function askAI(rawPrompt: string) {
    const prompt = rawPrompt.trim();
    if (!prompt || aiLoading) return;
    if (!canAsk) {
      onPricing();
      return;
    }
    setAiLoading(true);
    setAiError("");
    setAiAnswer("");
    try {
      const threadId = questionAiThreads.current[qIndex] ?? (
        await createQuestionAiThread({
          questionId: activeQuestion.questionId,
          scope: "question",
        })
      );
      questionAiThreads.current[qIndex] = threadId;

      await appendAiMessage({
        threadId,
        role: "user",
        content: prompt,
      });

      const answer = `${prompt}. In this ${exam.title} question, focus on the stem details first: ${activeQuestion.objective}. ${activeQuestion.explanation}`;
      await appendAiMessage({
        threadId,
        role: "assistant",
        content: answer,
      });

      setAiAnswer(answer);
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (message.includes("AI tutor is not available") || message.includes("limit")) {
        onPricing();
      }
      setAiError("Couldn't reach the tutor. Check your connection and try again.");
      setAiAnswer("");
    } finally {
      setAiLoading(false);
    }
  }

  const utils = [
    { key: "comments" as const, icon: MessageCircle, label: "Comments", count: storedCommentCount },
    { key: "rate" as const, icon: Star, label: "Rate", group: "feedback" },
    { key: "report" as const, icon: ShieldAlert, label: "Report", group: "feedback" },
    { key: "ask" as const, icon: Sparkles, label: "Ask AI" },
  ];

  return (
    <div className="dr-root">
      <div className="dr-top">
        <button className="dr-logo" onClick={() => setShowExit(true)} aria-label={`Exit ${title}`}>
          <div className="dr-logo-mark">D</div>
          <span className="dr-logo-word">DrNote</span>
        </button>
        <button className="dr-closebtn" aria-label="Exit" onClick={() => setShowExit(true)}>
          <X size={26} strokeWidth={2.5} />
        </button>
      </div>

      <div className="dr-progress-wrap">
        <div className="dr-progress-track">
          <div className="dr-progress-fill" style={{ width: `${progress}%`, background: "var(--purple)" }} />
        </div>
      </div>

      {isFree && remaining <= 2 && (
        <div className="free-limit-bar">
          <span className="badge badge-yellow"><Flame size={12} /> {remaining} questions left</span>
        </div>
      )}

      <main className="dr-main">
        <div className="dr-eyebrow">
          <span className="dr-chip">{activeQuestion.topic}</span>
          <span className="dr-chip sub">{activeQuestion.subtopic}</span>
        </div>

        <h1 className="dr-q-title">{activeQuestion.prompt}</h1>

        <div className="dr-choices">
          {activeQuestion.options.map(option => (
            <button
              key={option.id}
              className={optionClass(option.id)}
              disabled={answered}
              onClick={() => choosePracticeAnswer(option.id)}
            >
              <span className="dr-badge">{option.id}</span>
              <span className="dr-label">{option.label}</span>
              {answered && option.id === activeQuestion.correct && (
                <Check size={22} strokeWidth={3} color="#2a8c41" />
              )}
              {answered && option.id === selected && option.id !== activeQuestion.correct && (
                <X size={22} strokeWidth={3} color="#ea2b2b" />
              )}
            </button>
          ))}
        </div>

        {answered ? (
          <section className="dr-exp">
            <div className={`dr-exp-head ${isCorrect ? "ok" : "no"}`}>
              {isCorrect ? (
                <CheckCircle2 size={28} color="#2a8c41" strokeWidth={2.5} />
              ) : (
                <XCircle size={28} color="#ea2b2b" strokeWidth={2.5} />
              )}
              <div>
                <div className={`dr-exp-title ${isCorrect ? "ok" : "no"}`}>
                  {isCorrect ? "Correct" : "Incorrect"}
                </div>
                <div className="dr-exp-sub">Correct answer: {correctLabel}</div>
              </div>
            </div>
            <div className="dr-exp-body">
              <h4>Explanation</h4>
              <p>{activeQuestion.explanation}</p>
              <button
                className="dr-exp-ask"
                onClick={() => {
                  if (!canAsk) {
                    onPricing();
                    return;
                  }
                  openDrawer("ask");
                }}
              >
                <Sparkles size={18} strokeWidth={2.5} />
                <span>{canAsk ? "Ask AI about this" : "Ask AI about this (Pro)"}</span>
                <ChevronRight size={18} strokeWidth={2.8} />
              </button>
              <div className="dr-divider" />
              <h4>Why the other choices are wrong</h4>
              <div className="dr-why">
                {wrongChoices.map(option => (
                  <div className="dr-why-row" key={option.id}>
                    <span className="dr-why-key">{option.id}</span>
                    <span>
                      <strong>{option.label}.</strong> {activeQuestion.why[option.id]}
                    </span>
                  </div>
                ))}
              </div>
              <div className="dr-objective">
                <h4>Educational objective</h4>
                <p>{activeQuestion.objective}</p>
              </div>
            </div>
          </section>
        ) : (
          <p className="dr-tip">Tap an answer to reveal the explanation</p>
        )}
      </main>

      <footer className="dr-footer">
        <div className="dr-footer-in">
          <button
            className="dr-arrow"
            aria-label="Previous question"
            onClick={() => go(-1)}
            disabled={qIndex === 0}
          >
            <ChevronLeft size={26} strokeWidth={2.75} />
          </button>

          <button
            className={`dr-uitem dr-flag${flagged[qIndex] ? " active" : ""}`}
            onClick={() => {
              const nextFlagged = !flagged[qIndex];
              setFlagged(current => ({ ...current, [qIndex]: nextFlagged }));
              if (nextFlagged && activeQuestion.questionId) {
                void upsertReview({
                  questionId: activeQuestion.questionId,
                  status: "flagged",
                }).catch(() => {});
              }
            }}
            aria-pressed={!!flagged[qIndex]}
          >
            <Flag size={20} fill={flagged[qIndex] ? "currentColor" : "none"} />
            <span className="dr-uitem-label">Flag</span>
          </button>

          <div className="dr-utils">
            {utils.map(item => {
              const Icon = item.icon;
              const label = item.key === "ask" && !canAsk ? "Ask (Pro)" : item.label;
              const ariaLabel = item.count !== undefined && item.count > 0
                ? `${label}, ${item.count}`
                : label;
              return (
                <button
                  key={item.key}
                  className={[
                    "dr-uitem",
                    `dr-uitem-${item.key}`,
                    item.group ? `dr-uitem-${item.group}` : "",
                    drawer === item.key ? "active" : "",
                  ].filter(Boolean).join(" ")}
                  aria-label={ariaLabel}
                  onClick={() => {
                    if (item.key === "ask" && !canAsk) {
                      onPricing();
                      return;
                    }
                    openDrawer(item.key);
                  }}
                >
                  <Icon size={20} strokeWidth={2.5} />
                  <span className={item.key === "comments" ? "sr-only" : "dr-uitem-label"}>{label}</span>
                  {item.count !== undefined && item.count > 0 && <span className="dr-count" aria-hidden="true">{item.count}</span>}
                </button>
              );
            })}
          </div>

          <div className="dr-primary-actions">
            <div className="dr-bottom-count" aria-label={`Question ${qIndex + 1} of ${totalQ}`}>
              <strong>{qIndex + 1}</strong><span>/{totalQ}</span>
            </div>
            <button
              className="dr-arrow next"
              aria-label={isLastQuestion ? "Submit practice" : "Next question"}
              onClick={() => go(1)}
            >
              <span className="dr-next-label">{isLastQuestion ? "Submit" : "Next"}</span>
              <ChevronRight size={26} strokeWidth={2.75} />
            </button>
          </div>
        </div>
      </footer>

      {drawer && (
        <>
          <button className="dr-scrim" onClick={closeDrawer} aria-label="Close panel" />
          <aside className="dr-drawer" role="dialog" aria-modal="true">
            <div className="dr-drawer-head">
              <h3>
                {drawer === "comments" && "Comments"}
                {drawer === "rate" && "Rate this question"}
                {drawer === "report" && "Report a problem"}
                {drawer === "ask" && "Ask AI tutor"}
              </h3>
              <button className="dr-closebtn" aria-label="Close panel" onClick={closeDrawer}>
                <X size={24} strokeWidth={2.5} />
              </button>
            </div>
            <div className="dr-drawer-body">
              {drawer === "comments" && (
                <>
                  <form className="dr-comment-form" onSubmit={submitQuestionComment}>
                    <textarea
                      className="dr-field"
                      rows={3}
                      placeholder="Add a comment..."
                      value={commentDraft}
                      onChange={event => setCommentDraft(event.target.value)}
                    />
                    <button className="dr-btn-primary" disabled={!commentDraft.trim()}>
                      Add comment
                    </button>
                  </form>
                  {activeComments.length > 0 ? (
                    activeComments.map(comment => (
                      <article className="dr-comment" key={comment.id}>
                        <div className="dr-avatar">You</div>
                        <div>
                          <strong>You <span>{comment.createdAt}</span></strong>
                          <p>{comment.text}</p>
                        </div>
                      </article>
                    ))
                  ) : storedCommentCount > 0 ? (
                    <article className="dr-comment">
                      <div className="dr-avatar">SK</div>
                      <div>
                        <strong>Sara K. <span>2d</span></strong>
                        <p>Remember the 5 P&apos;s of pheochromocytoma: Pressure, Pain, Perspiration, Palpitations, Pallor.</p>
                      </div>
                    </article>
                  ) : (
                    <div className="dr-muted-center">No comments yet. Be the first.</div>
                  )}
                </>
              )}

              {drawer === "rate" && (
                <>
                  <p className="dr-drawer-prompt">How useful was this question?</p>
                  <div className="dr-stars-row">
                    {[1, 2, 3, 4, 5].map(number => (
                      <button
                        key={number}
                        className={`dr-starbtn${number <= rating ? " lit" : ""}`}
                        aria-label={`${number} stars`}
                        onClick={() => {
                          setRatings(current => ({ ...current, [qIndex]: number }));
                          void rateRemoteQuestion({
                            questionKey: activeCommentKey,
                            questionId: activeQuestion.questionId,
                            rating: number,
                          }).catch(() => {});
                        }}
                      >
                        <Star size={34} strokeWidth={2} fill={number <= rating ? "#ffc800" : "none"} />
                      </button>
                    ))}
                  </div>
                  {rating > 0 && <p className="dr-rating-thanks">Thanks for rating {rating} / 5</p>}
                </>
              )}

              {drawer === "report" && (
                reportDone ? (
                  <div className="dr-done-card">
                    <div className="dr-done-icon">
                      <CheckCircle2 size={34} strokeWidth={2.5} />
                    </div>
                    <h3>Report sent</h3>
                    <p>Our editors will review this question. Thank you.</p>
                  </div>
                ) : (
                  <>
                    <p className="dr-drawer-prompt">What&apos;s the issue?</p>
                    {REPORT_REASONS.map(reason => (
                      <button
                        key={reason}
                        className={`dr-reason${reportReason === reason ? " selected" : ""}`}
                        onClick={() => setReportReason(reason)}
                      >
                        <span className="dr-radio">
                          {reportReason === reason && <Check size={13} strokeWidth={3.5} color="#fff" />}
                        </span>
                        {reason}
                      </button>
                    ))}
                    <button
                      className="dr-btn-primary"
                      disabled={!reportReason}
                      onClick={() => {
                        if (!reportReason) return;
                        void reportRemoteQuestion({
                          questionKey: activeCommentKey,
                          questionId: activeQuestion.questionId,
                          reason: reportReason,
                        }).catch(() => {});
                        setReportDone(true);
                      }}
                    >
                      Submit report
                    </button>
                  </>
                )
              )}

              {drawer === "ask" && (
                <>
                  <p className="dr-drawer-prompt">Ask anything about this question.</p>
                  <div className="dr-suggest">
                    {["Why not B?", "Explain the mechanism", "Give a memory aid"].map(suggestion => (
                      <button key={suggestion} onClick={() => askAI(suggestion)}>
                        {suggestion}
                      </button>
                    ))}
                  </div>
                  {aiAnswer && <div className="dr-ai-answer">{aiAnswer}</div>}
                  {aiError && <div className="dr-ai-answer error">{aiError}</div>}
                  <textarea
                    className="dr-field"
                    rows={3}
                    placeholder="Type your question..."
                    value={aiInput}
                    onChange={event => setAiInput(event.target.value)}
                  />
                  <button
                    className="dr-btn-primary"
                    disabled={aiLoading || !aiInput.trim()}
                    onClick={() => askAI(aiInput)}
                  >
                    {aiLoading ? "Thinking..." : "Ask"}
                  </button>
                </>
              )}
            </div>
          </aside>
        </>
      )}

      {showExit && (
        <div className="dr-modal-scrim" onClick={() => setShowExit(false)}>
          <div className="dr-modal" onClick={event => event.stopPropagation()}>
            <div className="dr-modal-icon">
              <AlertTriangle size={30} strokeWidth={2.5} />
            </div>
            <h3>Leave this session?</h3>
            <p>Your progress on this question set won&apos;t be saved.</p>
            <div className="dr-modal-btns">
              <button
                className="dr-btn-danger"
                onClick={() => {
                  setShowExit(false);
                  setToast("Session ended");
                  onExit();
                }}
              >
                Leave
              </button>
              <button className="dr-btn-ghost" onClick={() => setShowExit(false)}>
                Keep studying
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="dr-toast">
          <Send size={15} strokeWidth={2.5} /> {toast}
        </div>
      )}
    </div>
  );
}

function QuestionCommentsDrawer({
  questionNumber,
  comments,
  commentDraft,
  setCommentDraft,
  submitComment,
  onClose,
}: {
  questionNumber: number;
  comments: ContentComment[];
  commentDraft: string;
  setCommentDraft: (value: string) => void;
  submitComment: (e: FormEvent) => void;
  onClose: () => void;
}) {
  return (
    <div className="comment-drawer-layer" role="dialog" aria-modal="true" aria-label={`Question ${questionNumber} comments`}>
      <button className="comment-drawer-scrim" onClick={onClose} aria-label="Close comments" />
      <aside className="comment-drawer">
        <header className="comment-drawer-head">
          <div>
            <span>Question {questionNumber}</span>
            <strong>Comments</strong>
          </div>
          <button className="comment-close-btn" onClick={onClose} aria-label="Close comments">
            <X size={18} />
          </button>
        </header>

        <form className="comment-composer" onSubmit={submitComment}>
          <textarea
            value={commentDraft}
            onChange={e => setCommentDraft(e.target.value)}
            onKeyDown={e => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                e.preventDefault();
                e.currentTarget.form?.requestSubmit();
              }
            }}
            placeholder="Add a comment..."
            rows={4}
          />
        </form>

        <div className="comment-list" aria-label={`${comments.length} comments`}>
          {comments.length === 0 && (
            <div className="comment-empty">
              <MessageCircle size={22} />
              <span>No comments yet.</span>
            </div>
          )}
          {comments.map(comment => (
            <article className="comment-item" key={comment.id}>
              <p>{comment.text}</p>
              <span>{comment.createdAt}</span>
            </article>
          ))}
        </div>
      </aside>
    </div>
  );
}

function formatExamTime(seconds: number) {
  const h = Math.floor(seconds / 3600).toString().padStart(2, "0");
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${h}:${m}:${s}`;
}

function MockExamRunner({
  exam, title, totalQ, timerOn, timerMinutes, onExit, onComplete,
}: {
  exam: Exam;
  title: string;
  totalQ: number;
  timerOn: boolean;
  timerMinutes: number;
  onExit: () => void;
  onComplete: (correct: number, total: number, mode: QuizMode, summary?: QuizSummary) => void;
}) {
  const questions = useMemo(
    () => Array.from({ length: totalQ }, (_, index) => ({
      ...MOCK_QUESTION_BANK[index % MOCK_QUESTION_BANK.length],
      id: index + 1,
    })),
    [totalQ],
  );
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [flagged, setFlagged] = useState<Record<number, boolean>>({});
  const [showPanel, setShowPanel] = useState(false);
  const [panelFilter, setPanelFilter] = useState<"all" | "flagged" | "unanswered" | "answered">("all");
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<null | { type: "skip" | "end" | "pause"; target?: number }>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timerOn ? timerMinutes * 60 : 0);

  const activeQuestion = questions[currentQ];
  const selected = answers[currentQ] ?? "";
  const answeredCount = Object.keys(answers).length;
  const flaggedCount = Object.values(flagged).filter(Boolean).length;
  const unansweredCount = totalQ - answeredCount;
  const currentQuestionMissing = answers[currentQ] === undefined;
  const progress = totalQ ? (answeredCount / totalQ) * 100 : 0;
  const timeWarning = timerOn && timeLeft < 600;
  const elapsedMinutes = Math.max(1, Math.round(((timerMinutes * 60) - timeLeft) / 60));

  const filteredIndices = questions.map((_, index) => index).filter((index) => {
    if (panelFilter === "flagged") return flagged[index];
    if (panelFilter === "unanswered") return answers[index] === undefined;
    if (panelFilter === "answered") return answers[index] !== undefined;
    return true;
  });

  function finishMock() {
    const correct = questions.reduce((sum, item, index) => (
      answers[index] === item.answer ? sum + 1 : sum
    ), 0);
    const subjectMap = new Map<string, SubjectPerformance>();
    const reviewItems: ReportReviewItem[] = [];
    questions.forEach((item, index) => {
      const subject = reportSubject(item.topic);
      const selectedAnswer = answers[index];
      const isAnswered = selectedAnswer !== undefined;
      const isCorrect = selectedAnswer === item.answer;
      const isFlagged = Boolean(flagged[index]);
      const current = subjectMap.get(subject) ?? {
        name: subject,
        correct: 0,
        incorrect: 0,
        unanswered: 0,
        flagged: 0,
        total: 0,
      };
      current.total += 1;
      if (isCorrect) current.correct += 1;
      else if (isAnswered) current.incorrect += 1;
      else current.unanswered += 1;
      if (isFlagged) current.flagged += 1;
      subjectMap.set(subject, current);

      if (!isAnswered || isFlagged || !isCorrect) {
        reviewItems.push({
          number: index + 1,
          subject,
          status: isFlagged
            ? "flagged"
            : !isAnswered
              ? "unanswered"
              : "incorrect",
          stem: item.stem,
        });
      }
    });
    onComplete(correct, totalQ, "mock", {
      answered: answeredCount,
      unanswered: unansweredCount,
      flagged: flaggedCount,
      minutes: timerOn ? elapsedMinutes : Math.max(1, Math.round(answeredCount * 1.2)),
      subjectBreakdown: Array.from(subjectMap.values()),
      reviewItems,
    });
  }

  useEffect(() => {
    setTimeLeft(timerOn ? timerMinutes * 60 : 0);
  }, [timerMinutes, timerOn, totalQ]);

  useEffect(() => {
    if (!timerOn || isPaused) return;
    if (timeLeft <= 0) {
      finishMock();
      return;
    }
    const interval = window.setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => window.clearInterval(interval);
  }, [answers, questions, timeLeft, timerOn, isPaused]);

  function chooseAnswer(choice: string) {
    setAnswers(prev => ({ ...prev, [currentQ]: choice }));
  }

  function moveToQuestion(index: number) {
    setCurrentQ(index);
    setShowPanel(false);
  }

  function requestQuestionMove(index: number) {
    if (index === currentQ) {
      setShowPanel(false);
      return;
    }
    if (currentQuestionMissing) {
      setConfirmAction({ type: "skip", target: index });
      return;
    }
    moveToQuestion(index);
  }

  function toggleFlag() {
    setFlagged(prev => ({ ...prev, [currentQ]: !prev[currentQ] }));
  }

  function nextQuestion() {
    if (currentQ >= totalQ - 1) {
      requestEndExam();
      return;
    }
    requestQuestionMove(currentQ + 1);
  }

  function previousQuestion() {
    if (currentQ <= 0) return;
    moveToQuestion(currentQ - 1);
  }

  function requestEndExam() {
    if (unansweredCount > 0) {
      setConfirmAction({ type: "end" });
      return;
    }
    setShowEndDialog(true);
  }

  function requestPauseExam() {
    if (unansweredCount > 0) {
      setConfirmAction({ type: "pause" });
      return;
    }
    setIsPaused(true);
  }

  function confirmPendingAction() {
    if (!confirmAction) return;
    if (confirmAction.type === "skip" && typeof confirmAction.target === "number") {
      moveToQuestion(confirmAction.target);
    }
    if (confirmAction.type === "end") setShowEndDialog(true);
    if (confirmAction.type === "pause") setIsPaused(true);
    setConfirmAction(null);
  }

  function cancelPendingAction() {
    setConfirmAction(null);
  }

  return (
    <div className="mock-exam-shell">
      <header className="mock-exam-topbar">
        <div className="mock-exam-title">
          <span><ClipboardCheck size={16} /></span>
          <strong>Mock Exam</strong>
        </div>
        <div className="mock-exam-progress" aria-label={`${answeredCount} of ${totalQ} answered`}>
          <div style={{ width: `${progress}%` }} />
        </div>
        <div className="mock-exam-count">
          <strong>{currentQ + 1}</strong><span>/</span>{totalQ}
        </div>
        <div className={`mock-exam-timer${timeWarning ? " warning" : ""}`}>
          <Timer size={15} />
          {timerOn ? formatExamTime(timeLeft) : "No timer"}
        </div>
        <button className="mock-pause-btn" onClick={requestPauseExam}>
          Pause
        </button>
        <button className="mock-end-btn" onClick={requestEndExam}>
          End Exam
        </button>
      </header>

      <main className="mock-exam-main">
        <section className="mock-exam-content" aria-label={`${title} question ${currentQ + 1}`}>
          <p className="quiz-stem mock-exam-stem">{activeQuestion.stem}</p>

          <div className="mock-exam-choices">
            {activeQuestion.choices.map((choice, index) => {
              const isSelected = selected === choice;
              return (
                <button
                  key={`${activeQuestion.id}-${choice}`}
                  className={`mock-exam-choice${isSelected ? " selected" : ""}`}
                  onClick={() => chooseAnswer(choice)}
                >
                  <span className="mock-choice-letter">{CHOICE_LABELS[index]}</span>
                  <span>{choice}</span>
                  {isSelected && <CheckCircle2 size={20} />}
                </button>
              );
            })}
          </div>

        </section>
      </main>

      <nav className="mock-exam-bottomnav" aria-label="Mock exam question controls">
        <button className="mock-nav-list" onClick={() => setShowPanel(true)}>
          <List size={18} />
          <span>All Questions</span>
        </button>
        <div className="mock-nav-controls">
          <button
            className="mock-secondary-next"
            onClick={previousQuestion}
            disabled={currentQ === 0}
          >
            <ChevronLeft size={17} />
            Back
          </button>
          <button
            className={`mock-flag-control${flagged[currentQ] ? " flagged" : ""}`}
            onClick={toggleFlag}
            aria-label={flagged[currentQ] ? "Unflag question" : "Flag question"}
          >
            <Flag size={17} fill={flagged[currentQ] ? "currentColor" : "none"} />
          </button>
          <button className="mock-primary-next" onClick={nextQuestion}>
            {currentQ >= totalQ - 1 ? "Submit" : "Next"}
            <ChevronRight size={17} />
          </button>
        </div>
        <div className="mock-nav-spacer" />
      </nav>

      {showPanel && (
        <div className="mock-overlay" role="dialog" aria-modal="true" aria-label="All questions">
          <button className="mock-overlay-scrim" onClick={() => setShowPanel(false)} aria-label="Close all questions" />
          <div className="mock-panel">
            <div className="mock-panel-head">
              <strong>All Questions</strong>
              <button onClick={() => setShowPanel(false)} aria-label="Close all questions">
                <X size={17} />
              </button>
            </div>
            <div className="mock-panel-tabs">
              {[
                { key: "all", label: "All", count: totalQ },
                { key: "flagged", label: "Flagged", count: flaggedCount },
                { key: "unanswered", label: "Unanswered", count: unansweredCount },
                { key: "answered", label: "Answered", count: answeredCount },
              ].map(tab => (
                <button
                  key={tab.key}
                  className={panelFilter === tab.key ? "active" : ""}
                  onClick={() => setPanelFilter(tab.key as typeof panelFilter)}
                >
                  {tab.label} <span>{tab.count}</span>
                </button>
              ))}
            </div>
            <div className="mock-question-grid">
              {filteredIndices.map(index => {
                const isAnswered = answers[index] !== undefined;
                const isFlagged = flagged[index];
                const isCurrent = index === currentQ;
                return (
                  <button
                    key={index}
                    className={`${isCurrent ? "current " : ""}${isFlagged ? "flagged " : ""}${isAnswered ? "answered" : ""}`}
                    onClick={() => requestQuestionMove(index)}
                  >
                    <span>{index + 1}</span>
                    <span>
                      {isFlagged && <Flag size={10} fill="currentColor" />}
                      {isAnswered ? <CheckCircle2 size={12} /> : <Circle size={12} />}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {showEndDialog && (
        <div className="mock-overlay" role="dialog" aria-modal="true" aria-label="End mock exam">
          <button className="mock-overlay-scrim" onClick={() => setShowEndDialog(false)} aria-label="Continue exam" />
          <div className="mock-end-dialog">
            <div className="mock-end-icon">
              <Timer size={24} />
            </div>
            <h2>Submit exam?</h2>
            <p>You answered <strong>{answeredCount}</strong> of <strong>{totalQ}</strong> questions.</p>
            <span>Time remaining: {timerOn ? formatExamTime(timeLeft) : "No timer"}</span>
            <div className="mock-end-actions">
              <button onClick={() => setShowEndDialog(false)}>Continue</button>
              <button onClick={finishMock}>Submit</button>
            </div>
          </div>
        </div>
      )}

      {confirmAction && (
        <div className="mock-overlay" role="dialog" aria-modal="true" aria-label="Confirm mock exam action">
          <button className="mock-overlay-scrim" onClick={cancelPendingAction} aria-label="Cancel action" />
          <div className="mock-confirm-dialog">
            <div className="mock-end-icon">
              <AlertTriangle size={24} />
            </div>
            <h2>
              {confirmAction.type === "skip" && "Skip this question?"}
              {confirmAction.type === "end" && "Submit with unfinished questions?"}
              {confirmAction.type === "pause" && "Pause exam?"}
            </h2>
            <p>
              {confirmAction.type === "skip"
                ? `Question ${currentQ + 1} is not done. You still have ${unansweredCount} question${unansweredCount === 1 ? "" : "s"} not done.`
                : `You still have ${unansweredCount} question${unansweredCount === 1 ? "" : "s"} not done.`}
            </p>
            <span>Do you want to continue?</span>
            <div className="mock-end-actions">
              <button onClick={cancelPendingAction}>No</button>
              <button onClick={confirmPendingAction}>Yes</button>
            </div>
          </div>
        </div>
      )}

      {isPaused && (
        <div className="mock-overlay" role="dialog" aria-modal="true" aria-label="Exam paused">
          <div className="mock-pause-dialog">
            <div className="mock-end-icon">
              <Timer size={24} />
            </div>
            <h2>Exam paused</h2>
            <p>{unansweredCount} question{unansweredCount === 1 ? "" : "s"} still missing.</p>
            <span>Timer resumes when you continue.</span>
            <button onClick={() => setIsPaused(false)}>Resume Exam</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Mock screen ──────────────────────────────────── */
function MockScreen({ exam, onBack, onStart }: { exam: Exam; onBack: () => void; onStart: () => void }) {
  const [extraTime, setExtraTime] = useState(false);

  return (
    <div className="mock-intro-shell">
      <div className="mock-intro-card">
        <div className="mock-intro-head">
          <div className="mock-intro-icon">
            <FileText size={20} />
          </div>
          <div>
            <h1>Mock Exam</h1>
            <p>{exam.title}</p>
          </div>
        </div>

        <div className="mock-info-group">
          <div className="mock-info-row">
            <FileText size={18} />
            <strong>20 Questions</strong>
          </div>

          <div className="mock-info-row">
            <Clock size={18} />
            <strong>2h 00m</strong>
          </div>

          <div className="mock-info-note">
            The timer keeps exam pacing realistic. Pausing, skipping, or ending with missing questions asks for confirmation first.
          </div>

          <button
            className="mock-accessibility"
            onClick={() => setExtraTime(v => !v)}
            aria-pressed={extraTime}
          >
            <span className={`mock-check-box${extraTime ? " checked" : ""}`}>
              {extraTime && <Check size={13} />}
            </span>
            <span>I will get extra time during my test for accessibility reasons</span>
            <Info size={15} />
          </button>
        </div>

        <div className="mock-intro-copy">
          <p>
            <strong>
              Our mock exam imitates both the time limit and question count of a professional certification exam.
            </strong>
          </p>
          <p>
            Full self-assessment with timer and automated score. Subject matter experts developed this content to prepare you for the types of questions you will see on the official examination.
          </p>
          <div className="mock-warning-line">
            <AlertTriangle size={15} />
            <span>Warning: You will NOT see these exact exam questions on exam day.</span>
          </div>
        </div>

        <button className="mock-start-btn" onClick={onStart}>
          Start Exam
        </button>
      </div>
    </div>
  );
}

/* ── Leaderboard tab ──────────────────────────────── */
function LeaderboardTab({ rows }: { rows: LeaderboardRow[] }) {
  return (
    <div className="screen">
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>🏆</div>
        <h2 style={{ fontFamily: "var(--display)", fontSize: 28 }}>Weekly Rankings</h2>
        <p style={{ color: "var(--muted)", fontWeight: 900, fontSize: 14, marginTop: 4 }}>
          Top 10 earn a streak shield
        </p>
      </div>
      <div className="card" style={{ padding: "8px 16px" }}>
        {rows.length > 0 ? rows.map(row => (
          <div
            key={row.userId}
            className="lb-item"
            style={row.isCurrentUser ? { background: "var(--green-soft)", borderRadius: 12, padding: "8px 12px", margin: "4px -12px" } : {}}
          >
            <span className={`lb-rank${row.rank <= 3 ? " top" : ""}`}>{row.rank}</span>
            <div className="lb-avatar" style={{ background: ["#ff9600", "#58cc02", "#1cb0f6", "#a560ff", "#ff4b4b", "#ce82ff", "#00b8a3"][Math.max(0, (row.rank - 1) % 7)] }}>
              {row.name[0]}
            </div>
            <span className="lb-name" style={row.isCurrentUser ? { color: "var(--green-d)", fontWeight: 900 } : {}}>
              {row.name} {row.isCurrentUser && "⭐"}
            </span>
            <span className="lb-xp">{row.xp.toLocaleString()} XP</span>
          </div>
        )) : (
          <p style={{ color: "var(--muted)", margin: "12px 4px" }}>No ranking data yet. Complete practice sessions to appear.</p>
        )}
      </div>
    </div>
  );
}

/* ── Profile tab ──────────────────────────────────── */
function ProfileTab({
  onPricing,
  isFree,
  isInviteTrial,
  inviteTrialDaysLeft,
  inviteCode,
  stats,
  topicMastery,
}: {
  onPricing: () => void;
  isFree: boolean;
  isInviteTrial: boolean;
  inviteTrialDaysLeft: number;
  inviteCode?: string;
  stats: DashboardStats;
  topicMastery: TopicMasteryRow[];
}) {
  const { user } = useUser();
  const userName = user?.fullName ?? user?.username ?? user?.primaryEmailAddress?.emailAddress ?? "Student";
  const [inviteUrl, setInviteUrl] = useState("");
  const [copiedInvite, setCopiedInvite] = useState(false);

  useEffect(() => {
    if (!inviteCode || typeof window === "undefined") {
      setInviteUrl("");
      return;
    }
    setInviteUrl(`${window.location.origin}/?${INVITE_QUERY_KEY}=${encodeURIComponent(inviteCode)}`);
  }, [inviteCode]);

  const copyInviteLink = async () => {
    if (!inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopiedInvite(true);
      window.setTimeout(() => setCopiedInvite(false), 1400);
    } catch {}
  };

  const metricCards = [
    { label: "Accuracy", value: `${stats.accuracy}%`, icon: Target, color: "var(--green)" },
    { label: "Questions", value: String(stats.questionsAnswered), icon: ClipboardCheck, color: "var(--blue)" },
    { label: "Day Streak", value: String(stats.streak), icon: Flame, color: "var(--orange)" },
    { label: "Est. Score", value: `${stats.estimatedScore}%`, icon: Trophy, color: "var(--yellow-d)" },
  ];
  const topicBars = topicMastery.length
    ? topicMastery.slice(0, 6).map(row => ({ t: row.topic, v: row.mastery, detail: `${row.answered}/${row.total}` }))
    : [{ t: "No answered topics yet", v: 0, detail: "0/0" }];
  return (
    <div className="screen">
      {/* profile header */}
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{
          width: 72, height: 72, borderRadius: "50%", background: "var(--blue)",
          color: "white", display: "grid", placeItems: "center",
          fontFamily: "var(--display)", fontSize: 30, fontWeight: 700,
          margin: "0 auto 12px", border: "4px solid var(--blue-d)",
        }}>
          {userInitial(userName, user?.primaryEmailAddress?.emailAddress)}
        </div>
        <h2 style={{ fontFamily: "var(--display)", fontSize: 24 }}>{userName}</h2>
        {isInviteTrial ? (
          <span className="badge badge-yellow" style={{ marginTop: 6 }}>
            <Sparkles size={12} /> Invite trial • {inviteTrialDaysLeft}d left
          </span>
        ) : isFree ? (
          <span className="badge badge-gray" style={{ marginTop: 6 }}>Free plan</span>
        ) : (
          <span className="badge badge-yellow" style={{ marginTop: 6 }}>
            <Crown size={12} /> Pro
          </span>
        )}
      </div>

      {/* invite share */}
      <div className="card" style={{ padding: 16, marginBottom: 16 }}>
        <div className="title-row" style={{ marginBottom: 12 }}>
          <h2>Invite friends</h2>
        </div>
        <p style={{ marginBottom: 10, color: "var(--muted)" }}>
          Share your link and give new users {INVITE_TRIAL_DAYS} free days when they sign up.
        </p>
        <div style={{ display: "grid", gap: 8 }}>
          <input
            className="field-input"
            value={inviteUrl}
            readOnly
            placeholder="Create an account to generate your invite link."
            onFocus={event => event.currentTarget.select()}
          />
          <button className="btn btn-green full" type="button" onClick={copyInviteLink} disabled={!inviteUrl}>
            <Copy size={14} /> {copiedInvite ? "Copied" : "Copy invite link"}
          </button>
        </div>
      </div>

      {/* stats */}
      <div className="stat-grid">
        {metricCards.map(s => (
          <div key={s.label} className="stat-card">
            <s.icon size={22} style={{ color: s.color, margin: "0 auto" }} />
            <div className="stat-card-val" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-card-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* mastery */}
      <div className="card" style={{ padding: 20, marginBottom: 16 }}>
        <div className="title-row" style={{ marginBottom: 16 }}>
          <h2>Mastery by topic</h2>
        </div>
        <div className="mastery-list">
          {topicBars.map(b => (
            <div key={b.t} className="mastery-row">
              <div className="mastery-row-header">
                <span style={{ fontWeight: 900 }}>{b.t}</span>
                <span>{b.v}% · {b.detail}</span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${b.v}%`,
                    background: b.v >= 75 ? "var(--green)" : b.v >= 55 ? "var(--yellow-d)" : "var(--orange)",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* upgrade nudge */}
      {isFree && (
        <div className="upgrade-nudge" style={{ marginBottom: 16 }}>
          <strong><InfinityIcon size={20} /> Unlock everything</strong>
          <span>Upgrade to Pro for unlimited questions and the AI tutor.</span>
          <button className="btn btn-yellow full" style={{ marginTop: 12 }} onClick={onPricing}>
            <Crown size={16} /> See Pro plans
          </button>
        </div>
      )}
    </div>
  );
}

function StudySetupModal({
  kind, title, questionCount, setQuestionCount, timerOn, setTimerOn,
  timerMinutes, setTimerMinutes, status, setStatus, onClose, onStart,
}: {
  kind: SetupKind;
  title: string;
  questionCount: number;
  setQuestionCount: (n: number) => void;
  timerOn: boolean;
  setTimerOn: (v: boolean) => void;
  timerMinutes: number;
  setTimerMinutes: (n: number) => void;
  status: QuestionStatus;
  setStatus: (s: QuestionStatus) => void;
  onClose: () => void;
  onStart: () => void;
}) {
  const titleMap: Record<SetupKind, string> = {
    subjects: "Subject block",
    tags: "Tag block",
    review: "Review block",
    session: "Session block",
  };

  return (
    <div className="backdrop setup-backdrop" onClick={onClose}>
      <div className="sheet setup-sheet" onClick={e => e.stopPropagation()}>
        <button className="sheet-close" onClick={onClose}><X size={18} /></button>
        <div>
          <span className="badge badge-blue">{titleMap[kind]}</span>
          <h2 style={{ marginTop: 10 }}>{title}</h2>
          <p>Select question count, timer, and question pool before starting.</p>
        </div>

        <label className="field-label">
          Question count
          <input
            className="field-input"
            type="number"
            inputMode="numeric"
            min={1}
            max={120}
            value={questionCount}
            onChange={e => setQuestionCount(Math.max(1, Number(e.target.value) || 1))}
          />
        </label>
        <div className="count-preset-row">
          {[5, 10, 20, 40].map(n => (
            <button key={n} className={`preset-chip${questionCount === n ? " active" : ""}`} onClick={() => setQuestionCount(n)}>
              {n}
            </button>
          ))}
        </div>

        <div className="setup-row">
          <div>
            <strong>Timer</strong>
            <span>{timerOn ? `${timerMinutes} minutes` : "Off"}</span>
          </div>
          <button className={`switch switch-blue ${timerOn ? "on" : ""}`} onClick={() => setTimerOn(!timerOn)} aria-label="Toggle timer">
            <span />
          </button>
        </div>

        {timerOn && (
          <label className="field-label">
            Minutes
            <input
              className="field-input"
              type="number"
              inputMode="numeric"
              min={1}
              max={240}
              value={timerMinutes}
              onChange={e => setTimerMinutes(Math.max(1, Number(e.target.value) || 1))}
            />
          </label>
        )}

        <div className="field-label">
          Question status
          <div className="status-toggle-grid" role="radiogroup" aria-label="Question status">
            {(["unused", "used", "incorrect", "flagged"] as QuestionStatus[]).map(option => (
              <button
                key={option}
                type="button"
                role="radio"
                className={`status-toggle${status === option ? " active" : ""}`}
                onClick={() => setStatus(option)}
                aria-checked={status === option}
              >
                {status === option && <Check size={15} />}
                {option}
              </button>
            ))}
          </div>
        </div>

        <button className="btn btn-blue full btn-lg" onClick={onStart}>
          Start questions <ArrowRight size={17} />
        </button>
      </div>
    </div>
  );
}

/* ── Limit modal ──────────────────────────────────── */
function LimitModal({
  remaining, questionLimit, onClose, onPricing, usageResetAt,
}: {
  remaining: number;
  questionLimit: number;
  onClose: () => void;
  onPricing: (plan?: BillingPlan) => void;
  usageResetAt: number;
}) {
  type LimitBillingPlan = Extract<BillingPlan, "monthly" | "yearly">;
  const [now, setNow] = useState(Date.now());
  const [selectedPlan, setSelectedPlan] = useState<LimitBillingPlan>("yearly");
  const [pressed, setPressed] = useState(false);
  const resetAt = usageResetAt;
  const tokens = {
    blue: "#1CB0F6",
    blueDark: "#1899D6",
    blueSoft: "#E1F3FE",
    purple: "#9333EA",
    purpleSoft: "#F3E8FF",
    ink: "#3C3C46",
    inkSoft: "#6B6B78",
    line: "#E5E7EB",
    field: "#F5F7FA",
    amberSoft: "#FEF3C7",
    green: "#22C55E",
  };
  const upgradeFeatures = [
    { icon: InfinityIcon, label: "Unlimited questions every day" },
    { icon: Tags, label: "All tag blocks and question pools" },
    { icon: BarChart3, label: "Timed mode with performance analytics" },
    { icon: Flag, label: "Review flagged and incorrect questions" },
  ];
  const upgradePlans: Record<LimitBillingPlan, {
    label: string;
    price: string;
    cadence: string;
    note: string;
    badge: string | null;
    anchor: string | null;
  }> = {
    yearly: {
      label: "Yearly",
      price: "4.99",
      cadence: "/mo",
      note: "Billed $59.88 once a year",
      badge: "Save 50%",
      anchor: "9.99",
    },
    monthly: {
      label: "Monthly",
      price: "9.99",
      cadence: "/mo",
      note: "Billed monthly, cancel anytime",
      badge: null,
      anchor: null,
    },
  };

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const diff = Math.max(0, resetAt - now);
  const h = Math.floor(diff / 3.6e6);
  const m = Math.floor((diff % 3.6e6) / 6e4);
  const s = Math.floor((diff % 6e4) / 1e3);
  const pad = (n: number) => String(n).padStart(2, "0");
  const used = Math.max(0, questionLimit - remaining);
  const progress = questionLimit > 0 ? Math.min(100, Math.round((used / questionLimit) * 100)) : 100;
  const activePlan = upgradePlans[selectedPlan];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="upgrade-title"
      className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6"
      style={{ fontFamily: "var(--display), var(--body), system-ui, sans-serif" }}
    >
      <div
        className="absolute inset-0"
        style={{ background: "rgba(60,60,70,0.45)", backdropFilter: "blur(6px)" }}
        onClick={onClose}
      />

      <div
        className="upg-card relative flex w-full flex-col overflow-hidden bg-white sm:max-w-md"
        style={{
          borderRadius: "28px 28px 0 0",
          maxHeight: "94vh",
          boxShadow: "0 24px 60px rgba(0,0,0,0.25)",
        }}
        onClick={e => e.stopPropagation()}
      >
        <style>{`
          .fixed { position: fixed; }
          .absolute { position: absolute; }
          .relative { position: relative; }
          .inset-0 { inset: 0; }
          .z-50 { z-index: 50; }
          .flex { display: flex; }
          .inline-flex { display: inline-flex; }
          .grid { display: grid; }
          .items-start { align-items: flex-start; }
          .items-end { align-items: flex-end; }
          .items-center { align-items: center; }
          .items-baseline { align-items: baseline; }
          .justify-center { justify-content: center; }
          .justify-between { justify-content: space-between; }
          .gap-1\\.5 { gap: 6px; }
          .gap-2 { gap: 8px; }
          .gap-3 { gap: 12px; }
          .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .space-y-3 > * + * { margin-top: 12px; }
          .w-full { width: 100%; }
          .max-w-md { max-width: 28rem; }
          .shrink-0 { flex-shrink: 0; }
          .flex-col { flex-direction: column; }
          .overflow-hidden { overflow: hidden; }
          .overflow-y-auto { overflow-y: auto; }
          .bg-white { background: #fff; }
          .p-0 { padding: 0; }
          .p-2\\.5 { padding: 10px; }
          .p-4 { padding: 16px; }
          .px-2 { padding-left: 8px; padding-right: 8px; }
          .px-3 { padding-left: 12px; padding-right: 12px; }
          .px-4 { padding-left: 16px; padding-right: 16px; }
          .px-5 { padding-left: 20px; padding-right: 20px; }
          .py-0\\.5 { padding-top: 2px; padding-bottom: 2px; }
          .py-1\\.5 { padding-top: 6px; padding-bottom: 6px; }
          .py-4 { padding-top: 16px; padding-bottom: 16px; }
          .pb-3 { padding-bottom: 12px; }
          .pb-5 { padding-bottom: 20px; }
          .pt-3 { padding-top: 12px; }
          .pt-4 { padding-top: 16px; }
          .pt-6 { padding-top: 24px; }
          .mt-1 { margin-top: 4px; }
          .mt-1\\.5 { margin-top: 6px; }
          .mt-2 { margin-top: 8px; }
          .mt-3 { margin-top: 12px; }
          .mt-4 { margin-top: 16px; }
          .mt-5 { margin-top: 20px; }
          .mt-6 { margin-top: 24px; }
          .mb-2 { margin-bottom: 8px; }
          .mb-4 { margin-bottom: 16px; }
          .-top-2\\.5 { top: -10px; }
          .left-3 { left: 12px; }
          .h-3 { height: 12px; }
          .h-full { height: 100%; }
          .rounded-full { border-radius: 999px; }
          .rounded-xl { border-radius: 12px; }
          .rounded-2xl { border-radius: 16px; }
          .text-left { text-align: left; }
          .text-center { text-align: center; }
          .text-xs { font-size: 12px; line-height: 16px; }
          .text-sm { font-size: 14px; line-height: 20px; }
          .text-base { font-size: 16px; line-height: 24px; }
          .text-lg { font-size: 18px; line-height: 28px; }
          .text-xl { font-size: 20px; line-height: 28px; }
          .text-2xl { font-size: 24px; line-height: 32px; }
          .text-\\[15px\\] { font-size: 15px; }
          .font-semibold { font-weight: 600; }
          .font-bold { font-weight: 700; }
          .font-extrabold { font-weight: 800; }
          .leading-tight { line-height: 1.25; }
          .uppercase { text-transform: uppercase; }
          .tracking-wide { letter-spacing: 0.025em; }
          .text-white { color: #fff; }
          .line-through { text-decoration-line: line-through; }
          .transition-all { transition: all 0.18s ease; }
          .transition-colors { transition: color 0.18s ease, background 0.18s ease; }
          .transition-transform { transition: transform 0.18s ease; }
          @media (min-width: 640px) {
            .upg-card { border-radius: 28px !important; }
            .sm\\:items-center { align-items: center; }
            .sm\\:p-6 { padding: 24px; }
            .sm\\:max-w-md { max-width: 28rem; }
            .sm\\:px-8 { padding-left: 32px; padding-right: 32px; }
            .sm\\:pb-6 { padding-bottom: 24px; }
            .sm\\:text-3xl { font-size: 30px; line-height: 36px; }
          }
          @media (prefers-reduced-motion: reduce) {
            .upg-anim { transition: none !important; animation: none !important; }
          }
        `}</style>

        <div className="overflow-y-auto px-5 pb-5 pt-6 sm:px-8">
          <div className="mb-4 flex items-start justify-between">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold"
              style={{ background: tokens.amberSoft, color: "#B45309" }}
            >
              <Zap size={15} strokeWidth={2.5} />
              {remaining === 0 ? "Daily limit reached" : "Almost at your limit"}
            </span>
            <button
              onClick={onClose}
              aria-label="Close"
              className="upg-anim rounded-full p-2.5 transition-colors"
              style={{ background: tokens.field, color: tokens.inkSoft }}
            >
              <X size={18} strokeWidth={2.5} />
            </button>
          </div>

          <h2
            id="upgrade-title"
            className="text-2xl font-extrabold leading-tight sm:text-3xl"
            style={{ color: tokens.ink }}
          >
            {remaining === 0
              ? `You finished all ${questionLimit} free questions today`
              : `${remaining} free questions left today`}
          </h2>
          <p className="mt-1.5 text-base font-semibold" style={{ color: tokens.inkSoft }}>
            Keep your streak going. Pro removes every limit.
          </p>

          <div className="mt-4 rounded-2xl p-4" style={{ background: tokens.field }}>
            <div className="mb-2 flex justify-between text-sm font-bold" style={{ color: tokens.inkSoft }}>
              <span>Questions today</span>
              <span style={{ color: tokens.ink }}>
                {Math.min(used, questionLimit)}/{questionLimit}
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-full" style={{ background: "#E2E8F0" }}>
              <div
                className="h-full rounded-full"
                style={{
                  width: `${progress}%`,
                  background: `linear-gradient(90deg, ${tokens.blue}, ${tokens.purple})`,
                }}
              />
            </div>
            <div className="mt-3 flex items-center justify-center gap-2 text-xs font-extrabold uppercase" style={{ color: tokens.inkSoft }}>
              <Clock size={14} strokeWidth={2.5} />
              Resets in {pad(h)}:{pad(m)}:{pad(s)}
            </div>
          </div>

          <ul className="mt-5 space-y-3">
            {upgradeFeatures.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-3">
                <span
                  className="flex shrink-0 items-center justify-center rounded-xl"
                  style={{ width: 34, height: 34, background: tokens.blueSoft, color: tokens.blueDark }}
                >
                  <Icon size={18} strokeWidth={2.5} />
                </span>
                <span className="text-[15px] font-bold" style={{ color: tokens.ink }}>
                  {label}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-6 grid grid-cols-2 gap-3" role="radiogroup" aria-label="Billing plan">
            {(["yearly", "monthly"] as LimitBillingPlan[]).map((key) => {
              const plan = upgradePlans[key];
              const active = selectedPlan === key;
              return (
                <button
                  key={key}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setSelectedPlan(key)}
                  className="upg-anim relative rounded-2xl px-4 pb-3 pt-4 text-left transition-all"
                  style={{
                    border: `2px solid ${active ? tokens.purple : tokens.line}`,
                    background: active ? tokens.purpleSoft : "#fff",
                    boxShadow: active ? "none" : `0 2px 0 ${tokens.line}`,
                  }}
                >
                  {plan.badge && (
                    <span
                      className="absolute -top-2.5 left-3 rounded-full px-2 py-0.5 text-xs font-extrabold text-white"
                      style={{ background: tokens.purple }}
                    >
                      {plan.badge}
                    </span>
                  )}
                  <div className="flex items-center gap-1.5 text-sm font-bold" style={{ color: active ? tokens.purple : tokens.inkSoft }}>
                    {active && <Check size={15} strokeWidth={3} />}
                    {plan.label}
                  </div>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    {plan.anchor && (
                      <span className="text-sm font-bold line-through" style={{ color: "#A3A3AE" }}>
                        ${plan.anchor}
                      </span>
                    )}
                    <span className="text-xl font-extrabold" style={{ color: tokens.ink }}>
                      ${plan.price}
                    </span>
                    <span className="text-sm font-bold" style={{ color: tokens.inkSoft }}>
                      {plan.cadence}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-center text-sm font-semibold" style={{ color: tokens.inkSoft }}>
            {activePlan.note}
          </p>
        </div>

        <div className="bg-white px-5 pb-5 pt-3 sm:px-8 sm:pb-6" style={{ borderTop: `1px solid ${tokens.line}` }}>
          <button
            type="button"
            onClick={() => onPricing(selectedPlan)}
            onMouseDown={() => setPressed(true)}
            onMouseUp={() => setPressed(false)}
            onMouseLeave={() => setPressed(false)}
            className="upg-anim flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-lg font-extrabold uppercase tracking-wide text-white transition-transform"
            style={{
              background: tokens.blue,
              boxShadow: pressed ? `0 0 0 ${tokens.blueDark}` : `0 4px 0 ${tokens.blueDark}`,
              transform: pressed ? "translateY(4px)" : "none",
            }}
          >
            <Sparkles size={20} strokeWidth={2.5} />
            Upgrade to Pro
            <ArrowRight size={20} strokeWidth={2.5} />
          </button>

          <div className="mt-3 flex items-center justify-center gap-1.5 text-sm font-bold" style={{ color: tokens.inkSoft }}>
            <ShieldCheck size={16} strokeWidth={2.5} style={{ color: tokens.green }} />
            7-day money-back guarantee. Cancel anytime
          </div>

          <button
            type="button"
            onClick={onClose}
            className="mt-2 w-full py-1.5 text-center text-sm font-bold"
            style={{ color: "#A3A3AE" }}
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Pricing modal ────────────────────────────────── */
function PricingModal({
  selectedPlan, setSelectedPlan, onClose, onSubscribe, isPaid,
}: {
  selectedPlan: BillingPlan;
  setSelectedPlan: (p: BillingPlan) => void;
  onClose: () => void;
  onSubscribe: () => void;
  isPaid: boolean;
}) {
  const selectedPlanInfo = PLANS.find(p => p.id === selectedPlan) ?? PLANS[2];
  const { isSignedIn } = useUser();

  return (
    <div className="backdrop backdrop-fullscreen" onClick={onClose}>
      <div className="sheet sheet-full pricing-sheet" onClick={e => e.stopPropagation()}>
        <button className="sheet-close" onClick={onClose}><X size={18} /></button>

        <div className="pricing-content">
          <div className="pricing-header">
            <h1>Upgrade to DrNote Pro</h1>
            <p>
              {isPaid
                ? "You're already on Pro."
                : `Free: ${DAILY_LIMIT} questions/day. Pro: unlimited questions, Ask AI, and mock exams.`}
            </p>
          </div>

          <section className="pricing-purchase-card" aria-label="Choose Pro plan">
            <div className="pricing-card-head">
              <span className="pricing-pro-label">
                <Crown size={15} />
                Pro
              </span>
              <div className="pricing-offer">
                <p>
                  <b>{selectedPlanInfo.price}</b>{selectedPlanInfo.cadence}
                </p>
                <strong>{selectedPlanInfo.name}</strong>
              </div>
              {selectedPlanInfo.save && <span className="pricing-save-note">{selectedPlanInfo.save}</span>}
            </div>

            <div className="pricing-plans" role="radiogroup" aria-label="Billing period">
              {PLANS.map(p => (
                <button
                  key={p.id}
                  type="button"
                  role="radio"
                  aria-checked={selectedPlan === p.id}
                  className={`plan-card${selectedPlan === p.id ? " active" : ""}`}
                  onClick={() => setSelectedPlan(p.id)}
                >
                  <span>
                    {selectedPlan === p.id && <Check size={15} />}
                    {p.name}
                  </span>
                  <strong>{p.price}</strong>
                  {p.save && <em>{p.save}</em>}
                </button>
              ))}
            </div>

            {isSignedIn ? (
              <div className="clerk-pricing-wrap">
                <PricingTable />
              </div>
            ) : (
              <button
                className="btn btn-green full btn-lg pricing-cta"
                disabled={isPaid}
                onClick={isPaid ? onClose : onSubscribe}
              >
                {isPaid ? "Already Pro" : "Start Pro"}
              </button>
            )}

            <ul className="pricing-simple-list">
              {PRICING_COMPARISON.map(item => (
                <li key={item.feature}>
                  <Check size={17} />
                  <span>{item.pro}</span>
                </li>
              ))}
            </ul>

            <div className="pricing-trust-row">
              <span><ShieldCheck size={15} /> Secure checkout</span>
              <span>Cancel anytime</span>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
