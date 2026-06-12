import type { Metadata } from "next";
import DrNoteApp from "@/components/drnote-app";
import { metadataForPath } from "@/lib/seo";

export const metadata: Metadata = metadataForPath({
  title: "Medical Exam Study Profile and Progress",
  description:
    "View DrNote profile progress, accuracy, question volume, streaks, estimated score, topic mastery, and Pro plan status.",
  path: "/profile",
  keywords: ["medical exam progress", "study profile", "question bank analytics", "topic mastery"],
});

export default function Page() {
  return <DrNoteApp initialScreen="home" initialTab="profile" />;
}
