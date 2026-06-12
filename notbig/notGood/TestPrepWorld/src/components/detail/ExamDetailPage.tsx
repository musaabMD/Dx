"use client";

import { useState } from "react";
import type { Exam } from "@/types/exam";
import { ThemeProvider, useThemeContext } from "@/contexts/ThemeContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DetailSidebar } from "./DetailSidebar";
import { DetailTopBar } from "./DetailTopBar";
import { DetailOverview } from "./DetailOverview";
import { DetailSubjects } from "./DetailSubjects";
import { DetailReview } from "./DetailReview";
import { DetailNotes } from "./DetailNotes";
import { DetailCommunity } from "./DetailCommunity";
import { DetailExperiences } from "./DetailExperiences";
import { DetailPractice } from "./DetailPractice";
import { AITutor } from "./AITutor";
import { OnlineMembersPanel } from "./OnlineMembersPanel";

interface ExamDetailPageProps {
  exam: Exam;
}

function ExamDetailContent({ exam }: ExamDetailPageProps) {
  const { isDark, toggleTheme, t } = useThemeContext();
  const [section, setSection] = useState("dashboard");
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
    dashboard: exam.description.slice(0, 60) + "…",
    quiz: "Practice · Create test, Quick 10, Review",
    flashcards: "Spaced repetition",
    review: `${correct} correct · ${incorrect} incorrect · ${bookmarked} bookmarked`,
    analytics: "Performance & stats",
    "ai-tutor": "Ask anything",
    subjects: `${exam.subjects.length} subjects`,
    notes: "Your notes",
    community: `${exam.communityPosts.length} posts`,
    experiences: `${exam.experiences.length} shared experiences`,
  };

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{
        background: t.bg,
        color: t.text,
        fontFamily: "'Bricolage Grotesque', sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@400;500&family=Bricolage+Grotesque:wght@500;700;900&display=swap');
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(128,128,128,0.2); border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(128,128,128,0.35); }
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(10px); }
          to   { opacity:1; transform:translateY(0); }
        }
      `}</style>

      <DetailSidebar
        exam={exam}
        section={section}
        onSectionChange={setSection}
        backHref="/"
        t={t}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <DetailTopBar
          section={section}
          subtitle={subtitles[section] ?? ""}
          t={t}
          isDark={isDark}
          onToggleTheme={toggleTheme}
        />

        <ScrollArea className="flex-1">
          <div
            className="p-7"
            style={{ background: t.bg, color: t.text }}
          >
            {section === "dashboard" && <DetailOverview exam={exam} t={t} />}
            {section === "quiz" && (
              <div className="h-full min-h-[60vh]">
                <DetailPractice t={t} />
              </div>
            )}
            {section === "flashcards" && (
              <div className="max-w-xl mx-auto">
                <DetailPractice t={t} view="flashcards" />
              </div>
            )}
            {section === "review" && (
              <DetailReview
                exam={exam}
                reviewState={reviewState}
                onReviewStateChange={setReviewState}
                t={t}
              />
            )}
            {section === "analytics" && (
              <div className="max-w-2xl">
                <DetailPractice t={t} view="analytics" />
              </div>
            )}
            {section === "ai-tutor" && <AITutor t={t} />}
            {section === "subjects" && <DetailSubjects exam={exam} t={t} />}
            {section === "notes" && <DetailNotes exam={exam} t={t} />}
            {section === "community" && <DetailCommunity exam={exam} t={t} />}
            {section === "experiences" && (
              <DetailExperiences exam={exam} t={t} />
            )}
          </div>
        </ScrollArea>
      </div>

      <OnlineMembersPanel exam={exam} t={t} />
    </div>
  );
}

export function ExamDetailPage({ exam }: ExamDetailPageProps) {
  return (
    <ThemeProvider>
      <ExamDetailContent exam={exam} />
    </ThemeProvider>
  );
}
