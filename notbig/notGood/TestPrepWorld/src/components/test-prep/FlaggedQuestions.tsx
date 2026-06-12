"use client";

import { useThemedColors } from "./useThemedColors";
import { Label } from "./Label";
import { Card } from "./Card";

const flags = [
  {
    q: "A 32-year-old woman presents with butterfly rash and joint pain...",
    topic: "Immunology",
    status: "incorrect" as const,
  },
  {
    q: "Which of the following is the most common cause of nephrotic syndrome in adults?",
    topic: "Nephrology",
    status: "correct" as const,
  },
  {
    q: "A neonate with bilious vomiting and double bubble sign on X-ray...",
    topic: "Pediatrics",
    status: "skipped" as const,
  },
];

export function FlaggedQuestions() {
  const c = useThemedColors();
  const statusColor: Record<string, string> = {
    correct: c.success,
    incorrect: c.error,
    skipped: c.warning,
  };
  return (
    <Card>
      <div
        style={{
          padding: "20px 24px",
          borderBottom: `1px solid ${c.border}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div
          style={{
            fontSize: 16,
            fontWeight: 800,
            color: c.text,
            fontFamily: "Georgia, serif",
          }}
        >
          🚩 Flagged Questions
        </div>
        <span style={{ fontSize: 12, color: c.textMuted }}>3 questions</span>
      </div>
      <div
        style={{
          padding: "16px 24px",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        {flags.map((f, i) => (
          <div
            key={i}
            style={{
              padding: "14px 16px",
              borderRadius: 10,
              border: `1.5px solid ${c.border}`,
              cursor: "pointer",
              transition: "box-shadow 0.15s",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 6,
              }}
            >
              <Label text={f.topic} />
              <Label
                text={f.status}
                color={statusColor[f.status]}
                bg={`${statusColor[f.status]}18`}
              />
            </div>
            <p
              style={{
                fontSize: 13,
                color: c.text,
                margin: 0,
                lineHeight: 1.6,
              }}
            >
              {f.q}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}
