"use client";

import { useState } from "react";
import type { Exam } from "@/types/exam";
import { useTheme } from "@/hooks/useTheme";
import { DetailSidebar } from "./DetailSidebar";
import { DetailTopBar } from "./DetailTopBar";
import { DetailOverview } from "./DetailOverview";
import { DetailSubjects } from "./DetailSubjects";
import { DetailReview } from "./DetailReview";
import { DetailNotes } from "./DetailNotes";
import { DetailCommunity } from "./DetailCommunity";
import { DetailExperiences } from "./DetailExperiences";
import { OnlineMembersPanel } from "./OnlineMembersPanel";

interface DetailPageProps {
  exam: Exam;
  dark: boolean;
  onBack: () => void;
}

export function DetailPage({ exam, dark, onBack }: DetailPageProps) {
  const t = useTheme(dark);
  const [section, setSection] = useState("overview");
  const [reviewState, setReviewState] = useState<
    Record<string, "correct" | "incorrect" | "bookmark" | undefined>
  >({});

  const correct =
    Object.values(reviewState).filter((v) => v === "correct").length;
  const incorrect =
    Object.values(reviewState).filter((v) => v === "incorrect").length;
  const bookmarked =
    Object.values(reviewState).filter((v) => v === "bookmark").length;

  const subtitles: Record<string, string> = {
    overview: exam.description.slice(0, 60) + "…",
    subjects: `${exam.subjects.length} subjects`,
    review: `${correct} correct · ${incorrect} incorrect · ${bookmarked} bookmarked`,
    notes: "Your notes",
    community: `${exam.communityPosts.length} posts`,
    experiences: `${exam.experiences.length} shared experiences`,
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        background: t.bg,
        fontFamily: "'Bricolage Grotesque', sans-serif",
        color: t.text,
      }}
    >
      <DetailSidebar
        exam={exam}
        section={section}
        onSectionChange={setSection}
        onBack={onBack}
        backHref={undefined}
        t={t}
      />

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <DetailTopBar
          section={section}
          subtitle={subtitles[section] ?? ""}
          t={t}
        />

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "28px 32px",
          }}
        >
          {section === "overview" && (
            <DetailOverview exam={exam} t={t} />
          )}
          {section === "subjects" && (
            <DetailSubjects exam={exam} t={t} />
          )}
          {section === "review" && (
            <DetailReview
              exam={exam}
              reviewState={reviewState}
              onReviewStateChange={setReviewState}
              t={t}
            />
          )}
          {section === "notes" && (
            <DetailNotes exam={exam} t={t} />
          )}
          {section === "community" && (
            <DetailCommunity exam={exam} t={t} />
          )}
          {section === "experiences" && (
            <DetailExperiences exam={exam} t={t} />
          )}
        </div>
      </div>

      <OnlineMembersPanel exam={exam} t={t} />
    </div>
  );
}
