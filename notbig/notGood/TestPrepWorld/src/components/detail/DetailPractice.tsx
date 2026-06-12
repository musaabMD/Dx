"use client";

import { useState } from "react";
import {
  QuizBuilder,
  QuestionScreen,
  ExplanationScreen,
  PerformanceDashboard,
  TimedExamBanner,
  ProgressStats,
  ActivityHeatmap,
  Flashcard,
  StreakGamification,
  QuestionOfTheDay,
  WeakTopics,
  ScorePredictor,
  StudyPlanner,
  Notebook,
  FlaggedQuestions,
  PeerComparison,
  ImageQuestion,
  EndScreen,
  ReviewCenter,
} from "@/components/test-prep";
import type { CompletedBlock } from "@/components/test-prep";
import type { ThemeTokens } from "@/hooks/useTheme";

type PracticeView =
  | "dashboard"
  | "quick10"
  | "qotd"
  | "weakest"
  | "create-test"
  | "timed"
  | "incorrect"
  | "marked"
  | "review-center"
  | "review-block";

type QuizPhase = "builder" | "question" | "explanation" | "end" | "review";
type QuizMode = "custom" | "quick10" | "qotd" | "timed" | "weakest" | "incorrect" | "marked";

interface DetailPracticeProps {
  t: ThemeTokens;
  view?: "quiz" | "flashcards" | "analytics";
}

export function DetailPractice({ t, view: sectionView }: DetailPracticeProps) {
  const [view, setView] = useState<PracticeView>("dashboard");
  const [quizPhase, setQuizPhase] = useState<QuizPhase>("builder");
  const [quizMode, setQuizMode] = useState<QuizMode>("custom");
  const [quizQuestionIndex, setQuizQuestionIndex] = useState(0);
  const [reviewingBlock, setReviewingBlock] = useState<CompletedBlock | null>(null);
  const [reviewQuestionIndex, setReviewQuestionIndex] = useState(0);

  const startQuiz = () => setQuizPhase("question");
  const submitAnswer = () => setQuizPhase("explanation");
  const nextQuestion = () => {
    if (quizQuestionIndex >= 2) {
      setQuizPhase("end");
    } else {
      setQuizQuestionIndex((i) => i + 1);
      setQuizPhase("question");
    }
  };
  const prevQuestion = () => {
    if (quizPhase === "explanation") setQuizPhase("question");
  };
  const finishQuiz = () => {
    setQuizPhase("builder");
    setQuizQuestionIndex(0);
    setView("dashboard");
  };
  const goToReview = () => {
    setView("review-block");
    setQuizPhase("review");
    setReviewingBlock({
      id: "current",
      title: "Hematology & Immunology",
      date: "Just now",
      correct: 30,
      total: 40,
      timeUsed: "24:37",
    });
    setReviewQuestionIndex(0);
  };
  const exitReview = () => {
    setQuizPhase("builder");
    setReviewingBlock(null);
    setView("review-center");
  };
  const launchFromView = (mode: QuizMode, targetView: PracticeView) => {
    setView(targetView);
    setQuizMode(mode);
    setQuizPhase(mode === "quick10" ? "question" : "builder");
    if (mode === "quick10") setQuizQuestionIndex(0);
  };

  // Direct view from sidebar (flashcards, analytics)
  if (sectionView === "flashcards") {
    return <Flashcard />;
  }
  if (sectionView === "analytics") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <PerformanceDashboard />
        <ProgressStats />
        <ActivityHeatmap />
        <PeerComparison />
        <ScorePredictor />
      </div>
    );
  }

  // Quiz section: dashboard + quiz flow
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 24,
        color: t.text,
      }}
    >
      {/* Dashboard */}
      {view === "dashboard" && quizPhase === "builder" && (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
              gap: 12,
            }}
          >
            <button
              onClick={() => launchFromView("quick10", "quick10")}
              style={{
                padding: 18,
                borderRadius: 12,
                border: `1px solid ${t.border}`,
                background: t.surface,
                color: t.text,
                cursor: "pointer",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 24, marginBottom: 6 }}>⚡</div>
              <div style={{ fontWeight: 700, fontSize: 13 }}>Quick 10</div>
            </button>
            <button
              onClick={() => launchFromView("qotd", "qotd")}
              style={{
                padding: 18,
                borderRadius: 12,
                border: `1px solid ${t.border}`,
                background: t.surface,
                color: t.text,
                cursor: "pointer",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 24, marginBottom: 6 }}>⭐</div>
              <div style={{ fontWeight: 700, fontSize: 13 }}>Q of Day</div>
            </button>
            <button
              onClick={() => launchFromView("weakest", "weakest")}
              style={{
                padding: 18,
                borderRadius: 12,
                border: `1px solid ${t.border}`,
                background: t.surface,
                color: t.text,
                cursor: "pointer",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 24, marginBottom: 6 }}>⚠️</div>
              <div style={{ fontWeight: 700, fontSize: 13 }}>Weakest</div>
            </button>
            <button
              onClick={() => launchFromView("custom", "create-test")}
              style={{
                padding: 18,
                borderRadius: 12,
                border: `1px solid ${t.border}`,
                background: t.surface,
                color: t.text,
                cursor: "pointer",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 24, marginBottom: 6 }}>📝</div>
              <div style={{ fontWeight: 700, fontSize: 13 }}>Create Test</div>
            </button>
            <button
              onClick={() => setView("review-center")}
              style={{
                padding: 18,
                borderRadius: 12,
                border: `1px solid ${t.border}`,
                background: t.surface,
                color: t.text,
                cursor: "pointer",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 24, marginBottom: 6 }}>📋</div>
              <div style={{ fontWeight: 700, fontSize: 13 }}>Review</div>
            </button>
            <button
              onClick={() => setView("timed")}
              style={{
                padding: 18,
                borderRadius: 12,
                border: `1px solid ${t.border}`,
                background: t.surface,
                color: t.text,
                cursor: "pointer",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 24, marginBottom: 6 }}>⏱</div>
              <div style={{ fontWeight: 700, fontSize: 13 }}>Timed</div>
            </button>
          </div>
          <StreakGamification />
          <QuestionOfTheDay />
          <WeakTopics
            onPracticeAll={() => launchFromView("weakest", "weakest")}
            onPracticeTopic={() => launchFromView("weakest", "weakest")}
          />
          <StudyPlanner />
          <ActivityHeatmap />
        </>
      )}

      {/* Quick 10 */}
      {view === "quick10" && quizMode === "quick10" && (
        <>
          {quizPhase === "question" && (
            <QuestionScreen onSubmit={submitAnswer} />
          )}
          {quizPhase === "explanation" && (
            <ExplanationScreen
              onPrevious={() => setQuizPhase("question")}
              onNext={() => {
                if (quizQuestionIndex >= 2) setQuizPhase("end");
                else {
                  setQuizQuestionIndex((i) => i + 1);
                  setQuizPhase("question");
                }
              }}
            />
          )}
          {quizPhase === "end" && (
            <EndScreen
              blockTitle="Quick 10 · Mixed"
              onReviewAnswers={goToReview}
              onNewQuiz={finishQuiz}
            />
          )}
        </>
      )}

      {/* QOTD */}
      {view === "qotd" && <QuestionOfTheDay />}

      {/* Weakest Subject */}
      {view === "weakest" && quizMode === "weakest" && (
        <>
          {quizPhase === "builder" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div
                style={{
                  padding: 16,
                  borderRadius: 10,
                  border: `1px solid ${t.border}`,
                  background: t.surface,
                  fontSize: 13,
                }}
              >
                Auto-built from weak areas · 20 questions
              </div>
              <QuizBuilder onStartQuiz={startQuiz} />
            </div>
          )}
          {quizPhase === "question" && (
            <QuestionScreen onSubmit={submitAnswer} />
          )}
          {quizPhase === "explanation" && (
            <ExplanationScreen onPrevious={prevQuestion} onNext={nextQuestion} />
          )}
          {quizPhase === "end" && (
            <EndScreen
              blockTitle="Weakest Subject"
              onReviewAnswers={goToReview}
              onNewQuiz={finishQuiz}
            />
          )}
        </>
      )}

      {/* Create Test / Incorrect / Marked */}
      {(view === "create-test" || view === "incorrect" || view === "marked") &&
        quizPhase === "builder" && (
          <QuizBuilder
            onStartQuiz={() => {
              setQuizPhase("question");
              setQuizQuestionIndex(0);
            }}
          />
        )}

      {(view === "create-test" || view === "incorrect" || view === "marked") &&
        quizPhase !== "builder" && (
          <>
            {quizPhase === "question" && (
              <>
                {quizQuestionIndex === 1 ? (
                  <ImageQuestion />
                ) : (
                  <QuestionScreen onSubmit={submitAnswer} />
                )}
                {quizQuestionIndex === 1 && (
                  <button
                    onClick={submitAnswer}
                    style={{
                      marginTop: 16,
                      padding: "12px 24px",
                      borderRadius: 10,
                      border: "none",
                      background: "#1a56db",
                      color: "#fff",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Submit Answer
                  </button>
                )}
              </>
            )}
            {quizPhase === "explanation" && (
              <ExplanationScreen
                onPrevious={prevQuestion}
                onNext={nextQuestion}
              />
            )}
            {quizPhase === "end" && (
              <EndScreen
                onReviewAnswers={goToReview}
                onNewQuiz={finishQuiz}
              />
            )}
          </>
        )}

      {/* Timed Exam */}
      {view === "timed" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <TimedExamBanner />
          <QuestionScreen />
        </div>
      )}

      {/* Review Center */}
      {view === "review-center" && !reviewingBlock && (
        <ReviewCenter
          onSelectBlock={(block) => {
            setReviewingBlock(block);
            setView("review-block");
            setReviewQuestionIndex(0);
          }}
        />
      )}

      {/* Review Block */}
      {(view === "review-block" || quizPhase === "review") && reviewingBlock && (
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>
                Review: {reviewingBlock.title}
              </div>
              <div style={{ fontSize: 12, color: t.muted }}>
                Question {reviewQuestionIndex + 1} of 3
              </div>
            </div>
            <button
              onClick={exitReview}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                border: `1px solid ${t.border}`,
                background: t.surface,
                color: t.text,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              ← Back
            </button>
          </div>
          <ExplanationScreen
            onPrevious={() =>
              setReviewQuestionIndex((i) => Math.max(0, i - 1))
            }
            onNext={() => {
              if (reviewQuestionIndex < 2) {
                setReviewQuestionIndex((i) => i + 1);
              } else {
                exitReview();
              }
            }}
          />
        </>
      )}
    </div>
  );
}
