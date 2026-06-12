import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DrNoteApp from "@/components/drnote-app";
import { examMetadata, getExamById, jsonLd, absoluteUrl } from "@/lib/seo";
import type { DrNoteScreen } from "@/lib/routes";
import { routeForScreen } from "@/lib/routes";

type ExamPageScreen = Exclude<DrNoteScreen, "home">;

export function metadataForExamPage(examId: string, initialScreen: ExamPageScreen): Metadata {
  const exam = getExamById(examId);

  if (!exam) {
    return {
      title: "Exam Not Found",
      robots: { index: false, follow: false },
    };
  }

  return examMetadata(exam, initialScreen, routeForScreen(initialScreen, exam.id));
}

export function ExamPageContent({
  examId,
  initialScreen,
}: {
  examId: string;
  initialScreen: ExamPageScreen;
}) {
  const exam = getExamById(examId);

  if (!exam) {
    notFound();
  }

  const routePath = routeForScreen(initialScreen, exam.id);
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: `${exam.title} medical exam prep`,
    description: `DrNote ${exam.title} preparation with ${exam.questions.toLocaleString()} practice questions, subject drills, mock exams, review queues, notes, AI tutor support, and analytics.`,
    url: absoluteUrl(routePath),
    provider: {
      "@type": "Organization",
      name: "DrNote",
      url: absoluteUrl("/"),
    },
    educationalLevel: "Medical education",
    teaches: exam.subjects,
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "online",
      courseWorkload: `${exam.questions.toLocaleString()} practice questions`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(structuredData)}
      />
      <DrNoteApp
        initialExamId={exam.id}
        initialScreen={initialScreen}
      />
    </>
  );
}
