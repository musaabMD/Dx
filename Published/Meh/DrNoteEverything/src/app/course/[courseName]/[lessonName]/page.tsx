import { PublicHeader } from "@/components/site-header";
import { ArrowLeft, Bookmark, Lock } from "lucide-react";
import Link from "next/link";

type CourseLessonPageProps = {
  params: Promise<{ courseName: string; lessonName: string }>;
};

function toTitle(value: string) {
  return decodeURIComponent(value)
    .replaceAll("-", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default async function CourseLessonPage({ params }: CourseLessonPageProps) {
  const { courseName, lessonName } = await params;
  const courseTitle = toTitle(courseName);
  const lessonTitle = toTitle(lessonName);

  return (
    <>
      <PublicHeader />
      <main className="standalone-resource-page">
        <section className="standalone-resource">
          <Link className="detail-back-link standalone-back-link" href={`/course/${courseName}`}>
            <ArrowLeft aria-hidden="true" size={14} strokeWidth={2.3} />
            {courseTitle}
          </Link>
          <span className="resource-detail-kicker standalone-kicker">Lesson</span>
          <h1>{lessonTitle}</h1>
          <p className="standalone-resource-lead">Continue this lesson from the course outline and save it to your library for repeated review.</p>
          <div className="standalone-resource-actions">
            <button type="button">
              <Bookmark aria-hidden="true" size={16} strokeWidth={2.2} />
              Save lesson
            </button>
            <span>12 min preview</span>
          </div>
          <div className="standalone-resource-panel">
            <h2>Lesson preview</h2>
            <p>This lesson includes guided notes, practice checkpoints, and linked files for the section.</p>
            <div className="resource-login-gate static">
              <Lock aria-hidden="true" size={18} strokeWidth={2.2} />
              <strong>Log in to view the full lesson</strong>
              <a href="/dashboard">Log in</a>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
