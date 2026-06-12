"use client";

import type { Exam } from "@/types/exam";

interface DetailReviewProps {
  exam: Exam;
  reviewState: Record<string, "correct" | "incorrect" | "bookmark" | undefined>;
  onReviewStateChange: (
    fn: (
      prev: Record<string, "correct" | "incorrect" | "bookmark" | undefined>
    ) => Record<string, "correct" | "incorrect" | "bookmark" | undefined>
  ) => void;
  t: {
    subtext: string;
    surface: string;
    surface2: string;
    border: string;
    muted: string;
  };
}

export function DetailReview({
  exam,
  reviewState,
  onReviewStateChange,
  t,
}: DetailReviewProps) {
  const correct =
    Object.values(reviewState).filter((v) => v === "correct").length;
  const incorrect =
    Object.values(reviewState).filter((v) => v === "incorrect").length;
  const bookmarked =
    Object.values(reviewState).filter((v) => v === "bookmark").length;

  const sampleQuestions = exam.subjects
    .flatMap((subj, si) =>
      Array.from({ length: 3 }, (_, qi) => ({
        id: `${si}-${qi}`,
        subject: subj,
        text: `Sample question ${qi + 1} from ${subj}`,
      }))
    )
    .slice(0, 12);

  return (
    <div style={{ maxWidth: "800px", animation: "fadeUp 0.3s ease" }}>
      <div
        style={{
          fontSize: "22px",
          fontWeight: 900,
          letterSpacing: "-0.02em",
          marginBottom: "6px",
        }}
      >
        My Review
      </div>
      <div
        style={{
          fontSize: "12px",
          color: t.subtext,
          fontFamily: "'DM Mono', monospace",
          marginBottom: "20px",
        }}
      >
        Mark questions correct, incorrect, or bookmark for later
      </div>

      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "24px",
          flexWrap: "wrap",
        }}
      >
        {[
          { label: "Correct", count: correct, color: "#22c55e", icon: "✓" },
          { label: "Incorrect", count: incorrect, color: "#ef4444", icon: "✗" },
          { label: "Bookmarked", count: bookmarked, color: "#f59e0b", icon: "⊙" },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              flex: 1,
              minWidth: "100px",
              background: t.surface,
              borderRadius: "10px",
              padding: "14px 18px",
              border: `1px solid ${t.border}`,
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}
          >
            <div
              style={{ fontSize: "24px", fontWeight: 900, color: stat.color }}
            >
              {stat.count}
            </div>
            <div
              style={{
                fontSize: "10px",
                color: t.subtext,
                fontFamily: "'DM Mono', monospace",
                letterSpacing: "0.06em",
              }}
            >
              {stat.label.toUpperCase()}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {sampleQuestions.map((q, i) => {
          const state = reviewState[q.id];
          return (
            <div
              key={q.id}
              style={{
                background: t.surface,
                borderRadius: "8px",
                padding: "14px 16px",
                border: `1px solid ${
                  state === "correct"
                    ? "#22c55e44"
                    : state === "incorrect"
                      ? "#ef444444"
                      : state === "bookmark"
                        ? "#f59e0b44"
                        : t.border
                }`,
                display: "flex",
                alignItems: "center",
                gap: "14px",
                animation: `fadeUp 0.3s ease ${i * 0.03}s both`,
              }}
            >
              <div
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: "10px",
                  color: t.muted,
                  minWidth: "20px",
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: "12px",
                    color: t.subtext,
                    fontFamily: "'DM Mono', monospace",
                    marginBottom: "2px",
                  }}
                >
                  {q.subject}
                </div>
                <div style={{ fontSize: "13px", fontWeight: 600 }}>{q.text}</div>
              </div>
              <div style={{ display: "flex", gap: "6px" }}>
                {[
                  { key: "correct" as const, label: "✓", color: "#22c55e" },
                  { key: "incorrect" as const, label: "✗", color: "#ef4444" },
                  { key: "bookmark" as const, label: "⊙", color: "#f59e0b" },
                ].map((btn) => (
                  <button
                    key={btn.key}
                    onClick={() =>
                      onReviewStateChange((prev) => ({
                        ...prev,
                        [q.id]:
                          prev[q.id] === btn.key ? undefined : btn.key,
                      }))
                    }
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "6px",
                      border: "none",
                      background:
                        state === btn.key ? `${btn.color}33` : t.surface2,
                      color: state === btn.key ? btn.color : t.muted,
                      fontSize: "13px",
                      cursor: "pointer",
                      fontWeight: 700,
                      transition: "all 0.15s",
                    }}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
