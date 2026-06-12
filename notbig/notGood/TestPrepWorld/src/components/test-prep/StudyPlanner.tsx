"use client";

import { useThemedColors } from "./useThemedColors";
import { Card } from "./Card";

const schedule = [
  { day: "Mon", topic: "Cardiology", done: true, q: 40 },
  { day: "Tue", topic: "Renal", done: true, q: 35 },
  { day: "Wed", topic: "Pulmonology", done: false, q: 40, today: true },
  { day: "Thu", topic: "Neuro", done: false, q: 40 },
  { day: "Fri", topic: "GI", done: false, q: 40 },
  { day: "Sat", topic: "Review", done: false, q: 80 },
];

export function StudyPlanner() {
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
        <div
          style={{
            fontSize: 16,
            fontWeight: 800,
            color: c.text,
            fontFamily: "Georgia, serif",
          }}
        >
          📅 Study Planner
        </div>
        <button
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: c.primary,
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
        >
          Edit Plan
        </button>
      </div>
      <div
        style={{
          padding: "16px 24px",
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {schedule.map((s) => (
          <div
            key={s.day}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "12px 16px",
              borderRadius: 10,
              border: `1.5px solid ${s.today ? c.primary : c.border}`,
              background: s.done ? "#f0fdf4" : s.today ? c.primaryLight : c.white,
            }}
          >
            <div style={{ width: 40, textAlign: "center" }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: c.textMuted,
                }}
              >
                {s.day}
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: c.text }}>
                {s.topic}
              </div>
              <div style={{ fontSize: 11, color: c.textMuted }}>
                {s.q} questions
              </div>
            </div>
            {s.done ? (
              <span
                style={{
                  color: c.success,
                  fontWeight: 800,
                  fontSize: 18,
                }}
              >
                ✓
              </span>
            ) : s.today ? (
              <button
                style={{
                  padding: "6px 14px",
                  borderRadius: 8,
                  border: "none",
                  background: c.primary,
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                Start
              </button>
            ) : (
              <span style={{ fontSize: 11, color: c.textMuted }}>Upcoming</span>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
