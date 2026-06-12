import { PublicHeader } from "@/components/site-header";
import { ResourceProductHub, type ResourceProduct } from "@/components/resource-product-hub";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const resourceTabs = ["Qbank", "Flashcards", "Files", "Study plans", "PPT", "Library", "Notes"];

const examTitles: Record<string, string> = {
  "aws-cloud-practitioner": "AWS Cloud Practitioner",
  ielts: "IELTS",
  mcat: "MCAT",
  "nclex-rn": "NCLEX-RN",
  sat: "SAT",
  "usmle-step-1": "USMLE Step 1",
};

const resources: ResourceProduct[] = [
  {
    id: 1,
    emoji: "🧠",
    title: "Priority practice set",
    subtitle: "Timed questions on delegation, safety, prioritization, and client teaching.",
    badge: "Qbank",
    date: "Today",
    dateGroup: "today",
    link: "#priority-practice-set",
    votes: 212,
  },
  {
    id: 2,
    emoji: "⚡",
    title: "High-yield recall",
    subtitle: "Medication, lab value, precaution, and procedure flashcards.",
    badge: "Flashcards",
    date: "May 9",
    dateGroup: "week",
    link: "#high-yield-recall",
    votes: 134,
  },
  {
    id: 3,
    emoji: "📄",
    title: "Exam prep packet",
    subtitle: "Blueprint files, rationales, and quick-reference checklists.",
    badge: "Files",
    date: "May 8",
    dateGroup: "month",
    link: "#exam-prep-packet",
    votes: 18,
  },
  {
    id: 4,
    emoji: "🗓️",
    title: "Readiness study plan",
    subtitle: "Adaptive schedule for content review, drills, and remediation blocks.",
    badge: "Study plans",
    date: "May 7",
    dateGroup: "month",
    link: "#readiness-study-plan",
    votes: 35,
  },
  {
    id: 5,
    emoji: "📊",
    title: "Systems review slides",
    subtitle: "Compact decks for fundamentals, maternity, pediatrics, and pharmacology.",
    badge: "PPT",
    date: "May 6",
    dateGroup: "month",
    link: "#systems-review-slides",
    votes: 16,
  },
  {
    id: 6,
    emoji: "📚",
    title: "Rationale library",
    subtitle: "Organized explanations by system, task, and test-taking pattern.",
    badge: "Library",
    date: "May 5",
    dateGroup: "month",
    link: "#rationale-library",
    votes: 57,
  },
  {
    id: 7,
    emoji: "📝",
    title: "Missed-question notes",
    subtitle: "Review notes grouped by concept gap, trap answer, and next action.",
    badge: "Notes",
    date: "May 4",
    dateGroup: "older",
    link: "#missed-question-notes",
    votes: 44,
  },
];

type ExamPageProps = {
  params: Promise<{ examName: string }>;
  searchParams: Promise<{ tab?: string; q?: string }>;
};

function toTitle(value: string) {
  if (examTitles[value]) {
    return examTitles[value];
  }

  return decodeURIComponent(value)
    .replaceAll("-", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default async function ExamPage({ params, searchParams }: ExamPageProps) {
  const { examName } = await params;
  const queryParams = await searchParams;
  const title = toTitle(examName);
  const initialTab = ["All", ...resourceTabs].includes(queryParams.tab ?? "") ? queryParams.tab ?? "All" : "All";
  const query = queryParams.q ?? "";
  const visibleResources = resources.filter((resource) => {
    const search = query.trim().toLowerCase();
    return !search || `${resource.title} ${resource.subtitle}`.toLowerCase().includes(search);
  });

  return (
    <>
      <PublicHeader />
      <main style={{ minHeight: "100vh", padding: "72px 24px 96px", background: "#fff", color: "#0f172a" }}>
        <section style={{ maxWidth: 920, margin: "0 auto", textAlign: "center" }}>
          <Link className="detail-back-link" href="/exams">
            <ArrowLeft aria-hidden="true" size={14} strokeWidth={2.3} />
            Exams
          </Link>
          <h1 style={{ fontSize: 48, lineHeight: 1.1, margin: "0 0 28px", fontWeight: 900 }}>{title}</h1>
          <form action={`/exams/${examName}`} style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
            <input name="tab" type="hidden" value={initialTab} />
            <input
              aria-label="Search exam resources"
              name="q"
              placeholder="Search resources"
              defaultValue={query}
              style={{
                width: "min(520px, 100%)",
                border: "1px solid #e2e8f0",
                borderRadius: 999,
                padding: "14px 20px",
                fontSize: 15,
                outline: "none",
              }}
            />
          </form>
          <ResourceProductHub basePath={`/exams/${examName}`} contextTitle={title} initialResourceType={initialTab} products={visibleResources} resourceTypes={resourceTabs} />
        </section>
      </main>
    </>
  );
}
