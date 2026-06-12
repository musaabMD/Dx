"use client";

import { useState } from "react";
import { colors } from "./colors";
import { Card } from "./Card";

const options = [
  "Increases insulin secretion from beta cells",
  "Activates AMPK to reduce hepatic glucose output",
  "Inhibits alpha-glucosidase enzymes in the gut",
  "Sensitizes adipose tissue to insulin via PPAR-γ",
];

export function Quick10() {
  const [current, setCurrent] = useState(0);

  return (
    <Card>
      <div
        style={{
          padding: "16px 24px",
          background: "linear-gradient(135deg, #059669, #0d9488)",
          borderRadius: "16px 16px 0 0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ color: "#fff" }}>
          <div style={{ fontWeight: 800, fontSize: 16 }}>⚡ Quick 10</div>
          <div style={{ fontSize: 11, opacity: 0.8, marginTop: 2 }}>
            Rapid daily practice
          </div>
        </div>
        <div
          style={{
            background: "rgba(255,255,255,0.2)",
            borderRadius: 20,
            padding: "5px 14px",
          }}
        >
          <span style={{ fontWeight: 800, fontSize: 16, color: "#fff" }}>
            {current + 1}
          </span>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.75)" }}> / 10</span>
        </div>
      </div>
      <div style={{ padding: "4px 24px", display: "flex", gap: 4 }}>
        {Array.from({ length: 10 }, (_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 10,
              background: i <= current ? colors.success : colors.border,
            }}
          />
        ))}
      </div>
      <div style={{ padding: "20px 24px" }}>
        <p
          style={{
            fontSize: 14,
            lineHeight: 1.7,
            color: colors.text,
            marginBottom: 16,
            fontFamily: "Georgia, serif",
          }}
        >
          Which of the following best describes the mechanism of action of metformin?
        </p>
        {options.map((opt, i) => (
          <button
            key={i}
            style={{
              display: "block",
              width: "100%",
              textAlign: "left",
              padding: "10px 14px",
              borderRadius: 8,
              border: `1.5px solid ${colors.border}`,
              background: colors.white,
              color: colors.text,
              fontWeight: 500,
              fontSize: 13,
              cursor: "pointer",
              marginBottom: 8,
            }}
          >
            {opt}
          </button>
        ))}
      </div>
    </Card>
  );
}
