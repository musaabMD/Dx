import type { Metadata } from "next";
import { metadataForPath } from "@/lib/seo";
import ExamBrowseClient from "./exam-browse-client";

export const metadata: Metadata = metadataForPath({
  title: "Browse Exams",
  description:
    "Browse exam prep options across language, graduate, medical, engineering, business, law, and civil service categories in DrNote.",
  path: "/browse",
  keywords: ["exam prep", "browse exams", "test prep", "question bank"],
});

export default function Page() {
  return <ExamBrowseClient />;
}
