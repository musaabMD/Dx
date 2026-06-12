import type { Metadata } from "next";
import DrNoteApp from "@/components/drnote-app";
import { metadataForPath } from "@/lib/seo";

export const metadata: Metadata = metadataForPath({
  title: "Medical Exam Prep Features",
  description:
    "Explore DrNote features for medical exam question banks, mock exams, notes, saved AI tutor history, analytics, and mistake review.",
  path: "/features",
  keywords: ["medical exam prep features", "medical qbank", "mock exam app", "AI medical tutor"],
});

export default function Page() {
  return <DrNoteApp initialScreen="home" initialTab="features" />;
}
