"use client";

import { useThemedColors } from "./useThemedColors";
import { Card } from "./Card";

const subjectStats = [
  { subject: "Cardiology", you: 82, avg: 71 },
  { subject: "Nephrology", you: 61, avg: 65 },
  { subject: "Neurology", you: 74, avg: 69 },
  { subject: "Pulmonology", you: 55, avg: 63 },
];

export function PeerComparison() {
  const c = useThemedColors();
  const peerStats = [
    ["You", 74, c.primary],
    ["Avg", 68, c.neutral],
    ["Top 10%", 88, "#7c3aed"],
  ] as const;
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
          Your Score vs Peers
        </div>
        <div style={{ fontSize: 12, color: c.textMuted, marginTop: 2 }}>
          Compared to 14,823 users
        </div>
      </div>
      <div style={{ padding: "24px 28px" }}>
        <div
          style={{
            display: "flex",
            gap: 16,
            marginBottom: 24,
            justifyContent: "center",
          }}
        >
          {peerStats.map(([label, val, colorVal]) => (
            <div
              key={label}
              style={{
                textAlign: "center",
                flex: 1,
                background: c.neutralLight,
                borderRadius: 12,
                padding: "16px 12px",
              }}
            >
              <div style={{ fontSize: 26, fontWeight: 900, color: colorVal }}>{val}%</div>
              <div style={{ fontSize: 12, color: c.textMuted, marginTop: 2 }}>
                {label}
              </div>
            </div>
          ))}
        </div>
        {subjectStats.map((s) => (
          <div key={s.subject} style={{ marginBottom: 14 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 12,
                marginBottom: 5,
              }}
            >
              <span style={{ fontWeight: 600, color: c.text }}>{s.subject}</span>
              <span
                style={{
                  color: s.you >= s.avg ? c.success : c.error,
                  fontWeight: 700,
                }}
              >
                You: {s.you}% · Avg: {s.avg}%
              </span>
            </div>
            <div
              style={{
                position: "relative",
                height: 10,
                background: c.neutralLight,
                borderRadius: 10,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${s.avg}%`,
                  background: "#cbd5e1",
                  borderRadius: 10,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  height: "100%",
                  width: `${s.you}%`,
                  background: s.you >= s.avg ? c.primary : c.error,
                  borderRadius: 10,
                  opacity: 0.75,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
