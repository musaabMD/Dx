import type { Metadata } from "next";
import type { DrNoteScreen } from "@/lib/routes";

export type Exam = {
  id: string;
  title: string;
  emoji: string;
  flag?: string;
  category?: string;
  questions: number;
  subjects: string[];
};

export const siteConfig = {
  name: "DrNote",
  url: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://drnote.app"),
  description:
    "DrNote is a mobile-first medical exam prep app for USMLE, MRCP, SMLE, and MCCQE with practice questions, mock exams, AI tutoring, notes, analytics, and review workflows.",
  keywords: [
    "DrNote",
    "medical exam prep",
    "USMLE Step 1 question bank",
    "MRCP Part 1 practice questions",
    "SMLE prep",
    "MCCQE Part I prep",
    "medical mock exams",
    "AI medical tutor",
    "medical student study app",
  ],
};

export const exams: Exam[] = [
  {
    id: "ielts",
    title: "IELTS",
    emoji: "🌐",
    category: "Language",
    questions: 1420,
    subjects: ["Listening", "Reading", "Writing", "Speaking"],
  },
  {
    id: "toefl",
    title: "TOEFL",
    emoji: "🌐",
    category: "Language",
    questions: 1360,
    subjects: ["Reading", "Listening", "Speaking", "Writing"],
  },
  {
    id: "duolingo",
    title: "Duolingo English Test",
    emoji: "🌐",
    category: "Language",
    questions: 980,
    subjects: ["Literacy", "Comprehension", "Conversation", "Production"],
  },
  {
    id: "sat",
    title: "SAT",
    emoji: "🎓",
    category: "Graduate",
    questions: 2100,
    subjects: ["Reading and Writing", "Algebra", "Advanced Math", "Problem Solving"],
  },
  {
    id: "gre",
    title: "GRE",
    emoji: "🎓",
    category: "Graduate",
    questions: 1850,
    subjects: ["Verbal Reasoning", "Quantitative Reasoning", "Analytical Writing", "Data Analysis"],
  },
  {
    id: "act",
    title: "ACT",
    emoji: "🎓",
    category: "Graduate",
    questions: 1680,
    subjects: ["English", "Math", "Reading", "Science"],
  },
  {
    id: "mcat",
    title: "MCAT",
    emoji: "🩺",
    category: "Medical",
    questions: 2840,
    subjects: ["Biology", "Chemistry", "Physics", "CARS"],
  },
  {
    id: "usmle-step-1",
    title: "USMLE Step 1",
    emoji: "🇺🇸",
    flag: "🇺🇸",
    category: "Medical",
    questions: 3180,
    subjects: ["Pathology", "Pharmacology", "Physiology", "Biochemistry"],
  },
  {
    id: "usmle",
    title: "USMLE",
    emoji: "🇺🇸",
    flag: "🇺🇸",
    category: "Medical",
    questions: 3180,
    subjects: ["Pathology", "Pharmacology", "Physiology", "Biochemistry"],
  },
  {
    id: "mrcp-part-1",
    title: "MRCP Part 1",
    emoji: "🇬🇧",
    flag: "🇬🇧",
    category: "Medical",
    questions: 2260,
    subjects: ["Cardiology", "Respiratory", "Renal", "Neurology"],
  },
  {
    id: "smle",
    title: "SMLE",
    emoji: "🇸🇦",
    flag: "🇸🇦",
    category: "Medical",
    questions: 1840,
    subjects: ["Medicine", "Surgery", "Pediatrics", "OB/GYN"],
  },
  {
    id: "mccqe",
    title: "MCCQE Part I",
    emoji: "🇨🇦",
    flag: "🇨🇦",
    category: "Medical",
    questions: 1725,
    subjects: ["Family Medicine", "Psychiatry", "Ethics", "Emergency"],
  },
  {
    id: "neet",
    title: "NEET",
    emoji: "🩺",
    category: "Medical",
    questions: 2460,
    subjects: ["Physics", "Chemistry", "Botany", "Zoology"],
  },
  {
    id: "fe",
    title: "FE Exam",
    emoji: "🧮",
    category: "Engineering",
    questions: 1320,
    subjects: ["Mathematics", "Statics", "Ethics", "Engineering Economics"],
  },
  {
    id: "pe",
    title: "PE Exam",
    emoji: "⚙️",
    category: "Engineering",
    questions: 1180,
    subjects: ["Project Planning", "Analysis", "Design", "Codes and Standards"],
  },
  {
    id: "gmat",
    title: "GMAT",
    emoji: "💼",
    category: "Business",
    questions: 1540,
    subjects: ["Quantitative Reasoning", "Verbal Reasoning", "Data Insights", "Critical Reasoning"],
  },
  {
    id: "cpa",
    title: "CPA",
    emoji: "💼",
    category: "Business",
    questions: 2240,
    subjects: ["AUD", "FAR", "REG", "TCP"],
  },
  {
    id: "lsat",
    title: "LSAT",
    emoji: "⚖️",
    category: "Law",
    questions: 1260,
    subjects: ["Logical Reasoning", "Reading Comprehension", "Argument Analysis", "Practice Tests"],
  },
  {
    id: "bar",
    title: "Bar Exam",
    emoji: "⚖️",
    category: "Law",
    questions: 1960,
    subjects: ["Contracts", "Torts", "Civil Procedure", "Constitutional Law"],
  },
  {
    id: "upsc",
    title: "UPSC",
    emoji: "🏛️",
    category: "Civil Service",
    questions: 2380,
    subjects: ["Polity", "Economy", "History", "Geography"],
  },
];

export const examScreenSeo: Record<Exclude<DrNoteScreen, "home">, {
  label: string;
  title: string;
  description: (exam: Exam) => string;
  keywords: (exam: Exam) => string[];
}> = {
  exam: {
    label: "Exam Hub",
    title: "%s Qbank, Mock Exams, Notes, and Analytics",
    description: exam =>
      `Prepare for ${exam.title} with ${exam.questions.toLocaleString()} practice questions, subject drills, tags, review queues, mock exams, notes, and performance analytics in DrNote.`,
    keywords: exam => [`${exam.title} prep`, `${exam.title} qbank`, `${exam.title} practice questions`, `${exam.title} mock exam`],
  },
  subjects: {
    label: "Subjects",
    title: "%s Subjects and Systems",
    description: exam =>
      `Study ${exam.title} by subject, system, specialty, and weak topic with configurable question blocks and progress tracking.`,
    keywords: exam => [`${exam.title} subjects`, `${exam.title} systems`, `${exam.title} topic review`],
  },
  tags: {
    label: "Tags",
    title: "%s Tag-Based Practice",
    description: exam =>
      `Use DrNote tags for ${exam.title} to practice weak topics, recall dates, flagged concepts, and high-yield labels.`,
    keywords: exam => [`${exam.title} tags`, `${exam.title} weak topics`, `${exam.title} high yield`],
  },
  review: {
    label: "Review",
    title: "%s Review Queue",
    description: exam =>
      `Review all, flagged, incorrect, and correct ${exam.title} questions with focused practice blocks and explanations.`,
    keywords: exam => [`${exam.title} review`, `${exam.title} incorrect questions`, `${exam.title} flagged questions`],
  },
  analysis: {
    label: "Analysis",
    title: "%s Performance Analysis",
    description: exam =>
      `Analyze ${exam.title} accuracy, pacing, streaks, topic gaps, and readiness with DrNote performance reports.`,
    keywords: exam => [`${exam.title} analytics`, `${exam.title} performance`, `${exam.title} score tracking`],
  },
  sessions: {
    label: "Sessions",
    title: "%s Study Sessions",
    description: exam =>
      `Resume ${exam.title} timed blocks, custom drills, review sessions, and mock exam reports from one study session dashboard.`,
    keywords: exam => [`${exam.title} study sessions`, `${exam.title} timed blocks`, `${exam.title} drills`],
  },
  notes: {
    label: "My Notes",
    title: "%s High-Yield Notes",
    description: exam =>
      `Save high-yield ${exam.title} notes, explanations, summaries, and reminders for fast review before exams.`,
    keywords: exam => [`${exam.title} notes`, `${exam.title} high yield notes`, `${exam.title} summaries`],
  },
  library: {
    label: "Library",
    title: "%s Saved Library",
    description: exam =>
      `Keep saved ${exam.title} explanations, tables, diagrams, and references in a searchable DrNote library.`,
    keywords: exam => [`${exam.title} library`, `${exam.title} references`, `${exam.title} explanations`],
  },
  ask: {
    label: "Ask",
    title: "%s AI Tutor",
    description: exam =>
      `Ask DrNote's AI tutor about ${exam.title} concepts, answer choices, weak topics, and saved study history.`,
    keywords: exam => [`${exam.title} AI tutor`, `${exam.title} GPT tutor`, `${exam.title} study help`],
  },
  practice: {
    label: "Practice",
    title: "%s Practice Questions",
    description: exam =>
      `Practice ${exam.title} questions with answer explanations, notes, bookmarks, comments, and adaptive study workflows.`,
    keywords: exam => [`${exam.title} practice`, `${exam.title} questions`, `${exam.title} explanations`],
  },
  mock: {
    label: "Mock Exam",
    title: "%s Mock Exam",
    description: exam =>
      `Take realistic timed ${exam.title} mock exams in DrNote and get score reports, pacing insights, and weak-topic review queues.`,
    keywords: exam => [`${exam.title} mock exam`, `${exam.title} self assessment`, `${exam.title} timed exam`],
  },
  report: {
    label: "Report",
    title: "%s Score Report",
    description: exam =>
      `Review ${exam.title} score reports with accuracy, pacing, correct answers, incorrect answers, and next-step study recommendations.`,
    keywords: exam => [`${exam.title} report`, `${exam.title} score report`, `${exam.title} readiness`],
  },
};

export function absoluteUrl(path = "/") {
  return new URL(path, siteConfig.url).toString();
}

export function getExamById(examId: string) {
  return exams.find(exam => exam.id === examId);
}

export function metadataForPath({
  title,
  description,
  path,
  keywords = [],
}: {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
}): Metadata {
  return {
    title,
    description,
    keywords: [...siteConfig.keywords, ...keywords],
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: absoluteUrl(path),
      siteName: siteConfig.name,
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export function examMetadata(exam: Exam, screen: Exclude<DrNoteScreen, "home">, path: string): Metadata {
  const seo = examScreenSeo[screen];
  const title = seo.title.replace("%s", exam.title);
  const description = seo.description(exam);

  return metadataForPath({
    title,
    description,
    path,
    keywords: seo.keywords(exam),
  });
}

export function jsonLd(value: unknown) {
  return { __html: JSON.stringify(value).replace(/</g, "\\u003c") };
}
