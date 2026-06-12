import type { Metadata } from "next";
import DrNoteApp from "@/components/drnote-app";
import { metadataForPath } from "@/lib/seo";

export const metadata: Metadata = metadataForPath({
  title: "Medical Exam Leaderboard and Study Rankings",
  description:
    "Track weekly DrNote study rankings, XP, streaks, and medical exam prep progress across USMLE, MRCP, SMLE, and MCCQE learners.",
  path: "/leaderboard",
  keywords: ["medical exam leaderboard", "study rankings", "medical student XP", "DrNote leaderboard"],
});

export default function Page() {
  return <DrNoteApp initialScreen="home" initialTab="leaderboard" />;
}
