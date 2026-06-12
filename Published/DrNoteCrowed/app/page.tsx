import type { Metadata } from "next";
import { metadataForPath, siteConfig } from "@/lib/seo";
import ExamBrowseClient from "./browse/exam-browse-client";

export const metadata: Metadata = metadataForPath({
  title: "Start Free Exam Practice",
  description:
    "Choose your exam and start free practice in DrNote with question banks, mock exams, AI tutoring, notes, analytics, and review workflows.",
  path: "/",
  keywords: [
    "free exam practice",
    "exam prep",
    "medical exam prep",
    "USMLE question bank",
    "IELTS practice",
    "DrNote",
    ...siteConfig.keywords,
  ],
});

export default function Page() {
  return <ExamBrowseClient />;
}
