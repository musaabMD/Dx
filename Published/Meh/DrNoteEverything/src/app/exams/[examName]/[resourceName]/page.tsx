import { CourseContent } from "@/components/course-content";
import { PublicHeader } from "@/components/site-header";
import { ArrowLeft, Bookmark, CheckCircle2, Circle, Lock } from "lucide-react";
import Link from "next/link";

type ExamResourcePageProps = {
  params: Promise<{ examName: string; resourceName: string }>;
};

function toTitle(value: string) {
  return decodeURIComponent(value)
    .replaceAll("-", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default async function ExamResourcePage({ params }: ExamResourcePageProps) {
  const { examName, resourceName } = await params;
  const examTitle = examName === "usmle-step-1" ? "USMLE Step 1" : toTitle(examName);
  const resourceTitle = toTitle(resourceName);

  if (examName === "usmle-step-1" && resourceName === "priority-practice-set") {
    return (
      <>
        <PublicHeader />
        <CourseContent />
      </>
    );
  }

  if (examName === "mcat" && resourceName === "missed-question-notes") {
    return (
      <>
        <PublicHeader />
        <CourseContent kicker={examTitle} title={resourceTitle} />
      </>
    );
  }

  return (
    <>
      <PublicHeader />
      <main className="standalone-resource-page">
        <section className="standalone-resource">
          <Link className="detail-back-link standalone-back-link" href={`/exams/${examName}`}>
            <ArrowLeft aria-hidden="true" size={14} strokeWidth={2.3} />
            {examTitle}
          </Link>
          <span className="resource-detail-kicker standalone-kicker">Resource</span>
          <h1>{resourceTitle}</h1>
          <div className="standalone-resource-actions">
            <button type="button">
              <Bookmark aria-hidden="true" size={16} strokeWidth={2.2} />
              Save resource
            </button>
            <span>Updated today</span>
          </div>
          <div className="standalone-resource-panel">
            <div className="resource-progress-head">
              <div>
                <h2>Checklist</h2>
                <p>3 of 5 tasks ready</p>
              </div>
              <strong>60%</strong>
            </div>
            <div className="resource-progress-bar"><span style={{ width: "60%" }} /></div>
            <div className="resource-checklist-list">
              {[
                ["Review overview", true],
                ["Open related notes", true],
                ["Complete practice block", true],
                ["Review missed questions", false],
                ["Save remediation plan", false],
              ].map(([label, done]) => (
                <div key={String(label)} className="resource-checklist-row">
                  {done ? <CheckCircle2 aria-hidden="true" size={18} /> : <Circle aria-hidden="true" size={18} />}
                  <span>{label}</span>
                </div>
              ))}
            </div>
            <div className="resource-login-gate static">
              <Lock aria-hidden="true" size={18} strokeWidth={2.2} />
              <strong>Sign up for free to view the full resource</strong>
              <a href="/dashboard">Sign up for free</a>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
