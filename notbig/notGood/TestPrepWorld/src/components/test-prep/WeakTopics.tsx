"use client";

import { useThemedColors } from "./useThemedColors";
import { Card } from "./Card";

const topics = [
  { name: "Acid-Base Disorders", score: 42, trend: "↓" },
  { name: "Pulmonary Physiology", score: 48, trend: "→" },
  { name: "Renal Pathology", score: 51, trend: "↑" },
  { name: "Autoimmune Diseases", score: 54, trend: "↑" },
  { name: "Pharmacokinetics", score: 57, trend: "→" },
];

interface WeakTopicsProps {
  onPracticeAll?: () => void;
  onPracticeTopic?: (topic: string) => void;
}

export function WeakTopics({ onPracticeAll, onPracticeTopic }: WeakTopicsProps) {
  const c = useThemedColors();
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
        <div>
          <div
            style={{
              fontSize: 16,
              fontWeight: 800,
              color: c.text,
              fontFamily: "Georgia, serif",
            }}
          >
            ⚠️ Weak Areas
          </div>
          <div style={{ fontSize: 12, color: c.textMuted, marginTop: 2 }}>
            Focus here to improve your score
          </div>
        </div>
        <button
          onClick={onPracticeAll}
          style={{
            padding: "7px 14px",
            borderRadius: 8,
            border: `1.5px solid ${c.primary}`,
            background: c.primaryLight,
            color: c.primary,
            fontWeight: 700,
            fontSize: 12,
            cursor: "pointer",
          }}
        >
          Practice All
        </button>
      </div>
      <div
        style={{
          padding: "16px 24px",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        {topics.map((t, i) => (
          <div
            key={t.name}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 14px",
              borderRadius: 10,
              background: c.neutralLight,
            }}
          >
            <span
              style={{
                fontSize: 13,
                fontWeight: 800,
                color: c.textMuted,
                width: 18,
              }}
            >
              #{i + 1}
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: c.text }}>
                {t.name}
              </div>
              <div
                style={{
                  height: 5,
                  background: c.border,
                  borderRadius: 10,
                  marginTop: 5,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${t.score}%`,
                    background: c.error,
                    borderRadius: 10,
                  }}
                />
              </div>
            </div>
            <span style={{ fontSize: 14, fontWeight: 800, color: c.error }}>
              {t.score}%
            </span>
            <button
              onClick={() => onPracticeTopic?.(t.name)}
              style={{
                padding: "5px 12px",
                borderRadius: 6,
                border: `1px solid ${c.primary}`,
                background: "transparent",
                color: c.primary,
                fontWeight: 600,
                fontSize: 11,
                cursor: "pointer",
              }}
            >
              Practice
            </button>
            <span style={{ fontSize: 16 }}>
              {t.trend === "↑" ? "📈" : t.trend === "↓" ? "📉" : "➡️"}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
