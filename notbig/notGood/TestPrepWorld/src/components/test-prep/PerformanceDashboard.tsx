"use client";

import { useThemedColors } from "./useThemedColors";
import { Card } from "./Card";

const subjects = [
  { name: "Cardiology", score: 82, questions: 145 },
  { name: "Nephrology", score: 61, questions: 89 },
  { name: "Neurology", score: 74, questions: 120 },
  { name: "Pulmonology", score: 55, questions: 67 },
  { name: "Hematology", score: 90, questions: 98 },
  { name: "Gastroenterology", score: 68, questions: 110 },
];

function getScoreColor(
  s: number,
  c: { success: string; warning: string; error: string }
) {
  return s >= 80 ? c.success : s >= 65 ? c.warning : c.error;
}

export function PerformanceDashboard() {
  const c = useThemedColors();
  return (
    <Card>
      <div
        style={{
          padding: "24px 28px",
          borderBottom: `1px solid ${c.border}`,
        }}
      >
        <div
          style={{
            fontSize: 18,
            fontWeight: 800,
            color: c.text,
            fontFamily: "Georgia, serif",
          }}
        >
          Performance Dashboard
        </div>
      </div>
      <div style={{ padding: "24px 28px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 14,
            marginBottom: 28,
          }}
        >
          {[
            {
              label: "Overall Score",
              value: "74%",
              icon: "📊",
              color: c.primary,
            },
            {
              label: "Questions Done",
              value: "629",
              icon: "✅",
              color: c.success,
            },
            {
              label: "Study Streak",
              value: "12 days",
              icon: "🔥",
              color: "#ea580c",
            },
            {
              label: "Percentile",
              value: "68th",
              icon: "🏆",
              color: "#7c3aed",
            },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                background: c.neutralLight,
                borderRadius: 12,
                padding: "18px 16px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 24, marginBottom: 6 }}>{s.icon}</div>
              <div
                style={{
                  fontWeight: 800,
                  fontSize: 22,
                  color: s.color,
                }}
              >
                {s.value}
              </div>
              <div style={{ fontSize: 11, color: c.textMuted, marginTop: 2 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: c.text,
            marginBottom: 14,
          }}
        >
          Subject Breakdown
        </div>
        {subjects.map((s) => (
          <div
            key={s.name}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 12,
            }}
          >
            <div
              style={{
                width: 120,
                fontSize: 13,
                color: c.text,
                fontWeight: 600,
              }}
            >
              {s.name}
            </div>
            <div
              style={{
                flex: 1,
                height: 20,
                background: c.neutralLight,
                borderRadius: 10,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${s.score}%`,
                  background: getScoreColor(s.score, c),
                  borderRadius: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  paddingRight: 8,
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#fff",
                  }}
                >
                  {s.score}%
                </span>
              </div>
            </div>
            <span
              style={{
                fontSize: 11,
                color: c.textMuted,
                width: 60,
                textAlign: "right",
              }}
            >
              {s.questions} Qs
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
