"use client";

import { useMemo } from "react";
import { useThemedColors } from "./useThemedColors";
import { Card } from "./Card";

const weeks = 15;
const days = 7;

const dayLabels = ["Mon", "", "Wed", "", "Fri", "", "Sun"];

export function ActivityHeatmap() {
  const c = useThemedColors();
  const bgColor = (v: number) =>
    v === 0
      ? c.neutralLight
      : v === 1
        ? "#bfdbfe"
        : v === 2
          ? "#93c5fd"
          : v === 3
            ? "#3b82f6"
            : "#1a56db";
  const data = useMemo(
    () =>
      Array.from({ length: weeks * days }, () =>
        Math.random() < 0.6 ? Math.floor(Math.random() * 5) : 0
      ),
    []
  );

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
        <div
          style={{
            fontSize: 16,
            fontWeight: 800,
            color: c.text,
            fontFamily: "Georgia, serif",
          }}
        >
          Study Activity
        </div>
        <div style={{ fontSize: 12, color: c.textMuted }}>Last 15 weeks</div>
      </div>
      <div style={{ padding: "24px 28px" }}>
        <div style={{ display: "flex", gap: 4 }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
              marginRight: 8,
            }}
          >
            {dayLabels.map((d, i) => (
              <div
                key={i}
                style={{
                  height: 14,
                  fontSize: 10,
                  color: c.textMuted,
                  lineHeight: "14px",
                }}
              >
                {d}
              </div>
            ))}
          </div>
          {Array.from({ length: weeks }, (_, wi) => (
            <div key={wi} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {Array.from({ length: days }, (_, di) => {
                const v = data[wi * days + di];
                return (
                  <div
                    key={di}
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: 3,
                      background: bgColor(v),
                      cursor: "pointer",
                    }}
                    title={`${v * 10} questions`}
                  />
                );
              })}
            </div>
          ))}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginTop: 14,
          }}
        >
          <span style={{ fontSize: 11, color: c.textMuted }}>Less</span>
          {[
            c.neutralLight,
            "#bfdbfe",
            "#93c5fd",
            "#3b82f6",
            "#1a56db",
          ].map((color, i) => (
            <div
              key={i}
              style={{
                width: 12,
                height: 12,
                borderRadius: 2,
                background: color,
              }}
            />
          ))}
          <span style={{ fontSize: 11, color: c.textMuted }}>More</span>
        </div>
      </div>
    </Card>
  );
}
