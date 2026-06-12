"use client";

import { useState } from "react";
import { useThemedColors } from "./useThemedColors";
import { Card } from "./Card";

const options = [
  "Aplastic crisis",
  "Splenic sequestration crisis",
  "Vaso-occlusive crisis",
  "Hemolytic transfusion reaction",
];

export function QuestionOfTheDay() {
  const [answered, setAnswered] = useState<number | null>(null);
  const c = useThemedColors();

  return (
    <Card>
      <div
        style={{
          padding: "16px 24px",
          background: "linear-gradient(135deg, #1a56db 0%, #7c3aed 100%)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>
            ⭐ Question of the Day
          </div>
          <div
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.75)",
              marginTop: 2,
            }}
          >
            March 6, 2026
          </div>
        </div>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "rgba(255,255,255,0.85)",
            background: "rgba(255,255,255,0.15)",
            padding: "5px 12px",
            borderRadius: 20,
          }}
        >
          Hematology
        </div>
      </div>
      <div style={{ padding: "20px 24px" }}>
        <p
          style={{
            fontSize: 14,
            lineHeight: 1.7,
            color: c.text,
            marginBottom: 16,
            fontFamily: "Georgia, serif",
          }}
        >
          A 5-year-old with sickle cell disease presents with acute onset of severe anemia
          and splenomegaly. His Hgb drops from 9 to 4 g/dL. What is the most likely
          diagnosis?
        </p>
        {options.map((opt, i) => (
          <button
            key={i}
            onClick={() => setAnswered(i)}
            style={{
              display: "block",
              width: "100%",
              textAlign: "left",
              padding: "10px 14px",
              borderRadius: 8,
              border: `1.5px solid ${answered === i ? (i === 1 ? "#a7f3d0" : "#fecaca") : c.border}`,
              background:
                answered === i
                  ? i === 1
                    ? c.successLight
                    : c.errorLight
                  : c.white,
              color: c.text,
              fontWeight: 500,
              fontSize: 13,
              cursor: "pointer",
              marginBottom: 8,
              transition: "all 0.15s",
            }}
          >
            {answered !== null && i === 1 && "✓ "}
            {opt}
          </button>
        ))}
        {answered !== null && (
          <div
            style={{
              background: c.neutralLight,
              borderRadius: 10,
              padding: "12px 14px",
              marginTop: 8,
              fontSize: 13,
              lineHeight: 1.6,
              color: c.text,
            }}
          >
            <strong>Splenic sequestration crisis</strong> occurs when RBCs are trapped in
            the spleen, causing acute splenomegaly and rapid drop in Hgb. Common in young
            children with SCD before autosplenectomy occurs.
          </div>
        )}
      </div>
    </Card>
  );
}
