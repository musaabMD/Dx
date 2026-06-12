"use client";

import { useState } from "react";
import { useThemedColors } from "./useThemedColors";
import { Card } from "./Card";

const topics = [
  "Cardiology",
  "Nephrology",
  "Pulmonology",
  "Gastroenterology",
  "Neurology",
  "Endocrinology",
  "Hematology",
  "Infectious Disease",
];

interface QuizBuilderProps {
  onStartQuiz?: () => void;
}

export function QuizBuilder({ onStartQuiz }: QuizBuilderProps) {
  const c = useThemedColors();
  const [qCount, setQCount] = useState(40);
  const [mode, setMode] = useState("tutor");
  const [selected, setSelected] = useState(["Cardiology", "Nephrology"]);
  const toggle = (t: string) =>
    setSelected((s) => (s.includes(t) ? s.filter((x) => x !== t) : [...s, t]));

  return (
    <Card>
      <div
        style={{
          padding: "24px 28px",
          borderBottom: `1px solid ${c.border}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 18,
              fontWeight: 800,
              color: c.text,
              fontFamily: "Georgia, serif",
            }}
          >
            Build Your Quiz
          </div>
          <div style={{ fontSize: 13, color: c.textMuted, marginTop: 2 }}>
            Customize your practice session
          </div>
        </div>
        <button
          onClick={onStartQuiz}
          style={{
            background: c.primary,
            color: "#fff",
            border: "none",
            borderRadius: 10,
            padding: "10px 22px",
            fontWeight: 700,
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          Start Quiz →
        </button>
      </div>
      <div
        style={{
          padding: "24px 28px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 24,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: c.textMuted,
              marginBottom: 10,
              textTransform: "uppercase",
              letterSpacing: "0.07em",
            }}
          >
            Topics
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {topics.map((t) => (
              <button
                key={t}
                onClick={() => toggle(t)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 8,
                  border: `1.5px solid ${selected.includes(t) ? c.primary : c.border}`,
                  background: selected.includes(t) ? c.primaryLight : c.white,
                  color: selected.includes(t) ? c.primary : c.text,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: c.textMuted,
                marginBottom: 10,
                textTransform: "uppercase",
                letterSpacing: "0.07em",
              }}
            >
              Questions: {qCount}
            </div>
            <input
              type="range"
              min={5}
              max={120}
              value={qCount}
              onChange={(e) => setQCount(+e.target.value)}
              style={{ width: "100%", accentColor: c.primary }}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 11,
                color: c.textMuted,
                marginTop: 4,
              }}
            >
              <span>5</span>
              <span>120</span>
            </div>
          </div>
          <div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: c.textMuted,
                marginBottom: 10,
                textTransform: "uppercase",
                letterSpacing: "0.07em",
              }}
            >
              Mode
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {["tutor", "timed", "exam"].map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  style={{
                    flex: 1,
                    padding: "8px 0",
                    borderRadius: 8,
                    border: `1.5px solid ${mode === m ? c.primary : c.border}`,
                    background: mode === m ? c.primary : c.white,
                    color: mode === m ? "#fff" : c.text,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    textTransform: "capitalize",
                  }}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: c.textMuted,
                marginBottom: 10,
                textTransform: "uppercase",
                letterSpacing: "0.07em",
              }}
            >
              Question Pool
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {["Unused", "Incorrect", "Flagged", "All"].map((p) => (
                <button
                  key={p}
                  style={{
                    flex: 1,
                    padding: "7px 0",
                    borderRadius: 8,
                    border: `1.5px solid ${c.border}`,
                    background: p === "Unused" ? c.successLight : c.white,
                    color: p === "Unused" ? c.success : c.text,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
