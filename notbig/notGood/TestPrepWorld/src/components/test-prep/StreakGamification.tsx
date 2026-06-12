"use client";

import { useThemedColors } from "./useThemedColors";
import { Card } from "./Card";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const done = [true, true, true, true, true, false, false];

export function StreakGamification() {
  const c = useThemedColors();
  return (
    <Card>
      <div
        style={{
          padding: "20px 24px",
          borderBottom: `1px solid ${c.border}`,
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
          Daily Progress
        </div>
      </div>
      <div style={{ padding: "24px 28px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 24,
          }}
        >
          <div style={{ fontSize: 48, lineHeight: 1 }}>🔥</div>
          <div>
            <div
              style={{
                fontSize: 32,
                fontWeight: 900,
                color: "#ea580c",
                lineHeight: 1,
              }}
            >
              12
            </div>
            <div style={{ fontSize: 13, color: c.textMuted }}>Day Streak</div>
          </div>
          <div style={{ marginLeft: "auto", textAlign: "right" }}>
            <div
              style={{
                fontSize: 18,
                fontWeight: 800,
                color: c.primary,
              }}
            >
              Level 8
            </div>
            <div style={{ fontSize: 11, color: c.textMuted }}>2,340 XP</div>
          </div>
        </div>
        <div
          style={{
            background: c.neutralLight,
            borderRadius: 10,
            padding: "6px 12px",
            marginBottom: 8,
          }}
        >
          <div
            style={{
              height: 8,
              background: c.border,
              borderRadius: 10,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: "68%",
                background: `linear-gradient(90deg, ${c.primary}, #7c3aed)`,
                borderRadius: 10,
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 11,
              color: c.textMuted,
              marginTop: 4,
            }}
          >
            <span>Level 8</span>
            <span>68% to Level 9</span>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
          {days.map((d, i) => (
            <div
              key={d}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: done[i] ? "#ea580c" : c.neutralLight,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                }}
              >
                {done[i] ? "🔥" : "○"}
              </div>
              <span style={{ fontSize: 11, color: c.textMuted }}>{d}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
