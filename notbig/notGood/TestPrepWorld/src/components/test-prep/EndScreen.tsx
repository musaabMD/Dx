"use client";

import { useThemedColors } from "./useThemedColors";
import { Card } from "./Card";

interface EndScreenProps {
  blockTitle?: string;
  onReviewAnswers?: () => void;
  onNewQuiz?: () => void;
}

export function EndScreen({
  blockTitle = "Block 3 · Hematology & Immunology · 40 Questions",
  onReviewAnswers,
  onNewQuiz,
}: EndScreenProps) {
  const c = useThemedColors();
  const stats = [
    ["30 / 40", "Correct", c.success],
    ["8 / 40", "Incorrect", c.error],
    ["24:37", "Time Used", c.primary],
  ] as const;
  return (
    <Card>
      <div style={{ padding: "32px 28px", textAlign: "center" }}>
        <div style={{ fontSize: 56, marginBottom: 12 }}>🎉</div>
        <div
          style={{
            fontSize: 24,
            fontWeight: 900,
            color: c.text,
            fontFamily: "Georgia, serif",
          }}
        >
          Quiz Complete!
        </div>
        <div
          style={{
            fontSize: 14,
            color: c.textMuted,
            marginTop: 6,
            marginBottom: 28,
          }}
        >
          {blockTitle}
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 12,
            marginBottom: 24,
          }}
        >
          {stats.map(([v, l, colorVal]) => (
            <div
              key={l}
              style={{
                background: c.neutralLight,
                borderRadius: 12,
                padding: "18px 12px",
              }}
            >
              <div style={{ fontSize: 22, fontWeight: 900, color: colorVal }}>{v}</div>
              <div style={{ fontSize: 11, color: c.textMuted, marginTop: 2 }}>
                {l}
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onReviewAnswers}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: 10,
              border: `1.5px solid ${c.border}`,
              background: c.white,
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
              color: c.text,
            }}
          >
            📊 Review Answers
          </button>
          <button
            onClick={onNewQuiz}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: 10,
              border: "none",
              background: c.primary,
              color: "#fff",
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            New Quiz →
          </button>
        </div>
      </div>
    </Card>
  );
}
