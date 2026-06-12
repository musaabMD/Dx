"use client";

import { useThemedColors } from "./useThemedColors";
import { Card } from "./Card";

export function ProgressStats() {
  const c = useThemedColors();
  const r = 52;
  const cx = 70;
  const cy = 70;
  const stroke = 9;
  const circumference = 2 * Math.PI * r;
  const pct = 0.74;

  const stats = [
    { label: "Correct", value: 30, total: 40, color: c.success },
    { label: "Incorrect", value: 8, total: 40, color: c.error },
    { label: "Omitted", value: 2, total: 40, color: c.warning },
  ];

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
          Session Summary
        </div>
      </div>
      <div
        style={{
          padding: "20px 24px",
          display: "flex",
          gap: 24,
          alignItems: "center",
        }}
      >
        <div style={{ flexShrink: 0 }}>
          <svg width={140} height={140}>
            <circle
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={c.border}
              strokeWidth={stroke}
            />
            <circle
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={c.success}
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - pct)}
              transform={`rotate(-90 ${cx} ${cy})`}
            />
            <text
              x={cx}
              y={cy - 6}
              textAnchor="middle"
              fontSize={22}
              fontWeight={800}
              fill={c.text}
            >
              74%
            </text>
            <text
              x={cx}
              y={cy + 14}
              textAnchor="middle"
              fontSize={11}
              fill={c.textMuted}
            >
              Correct
            </text>
          </svg>
        </div>
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          {stats.map((s) => (
            <div key={s.label}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 13,
                  marginBottom: 5,
                }}
              >
                <span style={{ fontWeight: 600, color: c.text }}>{s.label}</span>
                <span style={{ fontWeight: 700, color: s.color }}>
                  {s.value} / {s.total}
                </span>
              </div>
              <div
                style={{
                  height: 8,
                  background: c.neutralLight,
                  borderRadius: 10,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${(s.value / s.total) * 100}%`,
                    background: s.color,
                    borderRadius: 10,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
