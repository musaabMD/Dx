import {
  BarChart3,
  BookOpen,
  Brain,
  ClipboardCheck,
  FileText,
  History,
  Library,
  MessageCircle,
  Microscope,
  Stethoscope,
  Tags,
  Timer,
} from "lucide-react";
import { exams } from "@/lib/seo";
import type { Exam } from "@/lib/seo";

export { exams };
export type { Exam };

export type ReviewState = "all" | "flagged" | "incorrect" | "correct";

export type HubLink = {
  id: string;
  label: string;
  detail: string;
  count: string;
  icon: typeof BookOpen;
  locked?: boolean;
};

export const hubLinks: HubLink[] = [
  {
    id: "subjects",
    label: "Subjects",
    detail: "Study by system, specialty, or weak topic.",
    count: "14 lists",
    icon: BookOpen,
  },
  {
    id: "tags",
    label: "Tags",
    detail: "Study by topic, recall date, or custom label.",
    count: "26 tags",
    icon: Tags,
  },
  {
    id: "mock",
    label: "Mock Exam",
    detail: "Full self-assessment with timer and automated score.",
    count: "2 ready",
    icon: ClipboardCheck,
  },
  {
    id: "review",
    label: "Review",
    detail: "All, flagged, incorrect, and correct questions.",
    count: "418 saved",
    icon: History,
  },
  {
    id: "analysis",
    label: "Analysis",
    detail: "Accuracy, pacing, streak, and topic gaps.",
    count: "78%",
    icon: BarChart3,
  },
  {
    id: "sessions",
    label: "Sessions",
    detail: "Resume timed blocks and custom drills.",
    count: "5 active",
    icon: Timer,
  },
  {
    id: "notes",
    label: "My Notes",
    detail: "High-yield summaries and personal comments.",
    count: "32 notes",
    icon: FileText,
  },
  {
    id: "library",
    label: "Library",
    detail: "Saved explanations, tables, and references.",
    count: "91 items",
    icon: Library,
  },
  {
    id: "ask",
    label: "Ask",
    detail: "GPT-style tutor with saved history.",
    count: "Upgrade",
    icon: MessageCircle,
    locked: true,
  },
];

export const question = {
  stem:
    "A 27-year-old medical student develops episodic palpitations, sweating, and headaches. Blood pressure is 172/102 mmHg during attacks. Which biochemical finding is most likely elevated?",
  topic: "Endocrine pathology",
  recall: "Recall in 1 month",
  difficulty: "High-yield",
  choices: [
    "Urinary metanephrines",
    "Serum cortisol after dexamethasone",
    "Plasma renin activity",
    "Thyroid-stimulating hormone",
  ],
  answer: "Urinary metanephrines",
  explanation:
    "Paroxysmal hypertension with palpitations, diaphoresis, and headache points to pheochromocytoma, classically screened with plasma or urinary metanephrines.",
};

export const reviewCounts: Record<ReviewState, number> = {
  all: 418,
  flagged: 61,
  incorrect: 144,
  correct: 213,
};

export const subjects = [
  { name: "Pathology", icon: Microscope, progress: 73 },
  { name: "Pharmacology", icon: Stethoscope, progress: 58 },
  { name: "Physiology", icon: Brain, progress: 64 },
];
