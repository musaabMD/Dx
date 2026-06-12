"use client";

import { useState } from "react";
import { useThemedColors } from "./useThemedColors";
import { Label } from "./Label";
import { Card } from "./Card";

const opts = ["A", "B", "C", "D", "E"];
const labels = [
  "The underlying cause is a deficiency of pyruvate kinase leading to hemolytic anemia.",
  "Osmotic fragility test would be positive for hereditary spherocytosis.",
  "G6PD deficiency results in Heinz body formation after oxidative stress.",
  "Sickle cell disease is caused by a point mutation substituting glutamic acid for valine.",
  "Iron deficiency anemia is characterized by microcytic, hypochromic red cells.",
];

interface QuestionScreenProps {
  onSubmit?: () => void;
}

export function QuestionScreen({ onSubmit }: QuestionScreenProps) {
  const c = useThemedColors();
  const [selected, setSelected] = useState<string | null>(null);
  const [crossed, setCrossed] = useState<string[]>([]);
  const [flagged, setFlagged] = useState(false);
  const toggleCross = (o: string) =>
    setCrossed((prev) => (prev.includes(o) ? prev.filter((x) => x !== o) : [...prev, o]));

  return (
    <Card>
      <div
        style={{
          padding: "16px 24px",
          borderBottom: `1px solid ${c.border}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: c.neutralLight,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: c.textMuted }}>
            Question 12 of 40
          </span>
          <div
            style={{
              width: 160,
              height: 5,
              background: c.border,
              borderRadius: 10,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: "30%",
                height: "100%",
                background: c.primary,
                borderRadius: 10,
              }}
            />
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: flagged ? c.warningLight : c.neutralLight,
              padding: "5px 12px",
              borderRadius: 8,
              cursor: "pointer",
            }}
            onClick={() => setFlagged(!flagged)}
          >
            <span style={{ fontSize: 14 }}>{flagged ? "🚩" : "⚑"}</span>
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: flagged ? c.warning : c.textMuted,
              }}
            >
              Flag
            </span>
          </div>
          <div
            style={{
              background: "#fff3e0",
              color: "#e65100",
              fontWeight: 800,
              padding: "5px 14px",
              borderRadius: 8,
              fontSize: 14,
              fontFamily: "monospace",
            }}
          >
            ⏱ 01:24
          </div>
        </div>
      </div>
      <div style={{ padding: "28px 28px 0" }}>
        <div
          style={{
            fontSize: 13,
            color: c.textMuted,
            fontWeight: 600,
            marginBottom: 12,
          }}
        >
          <Label text="Hematology" /> &nbsp;
          <Label text="Biochemistry" bg={c.neutralLight} color={c.neutral} />
        </div>
        <p
          style={{
            fontSize: 15,
            lineHeight: 1.8,
            color: c.text,
            marginBottom: 20,
            fontFamily: "Georgia, serif",
          }}
        >
          A 24-year-old African American male presents with jaundice, pallor, and fatigue
          after starting a course of primaquine for malaria prophylaxis. His peripheral blood
          smear shows <strong>Heinz bodies</strong> and bite cells. Labs show elevated
          indirect bilirubin, decreased haptoglobin, and elevated LDH. Which of the
          following best explains the pathophysiology of his anemia?
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 8,
            padding: 12,
            marginBottom: 16,
            background: c.neutralLight,
            borderRadius: 8,
          }}
        >
          {[
            ["Hemoglobin", "7.8 g/dL ↓"],
            ["MCV", "82 fL"],
            ["Reticulocytes", "8.2% ↑"],
            ["LDH", "680 U/L ↑"],
          ].map(([k, v]) => (
            <div
              key={k}
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 13,
                padding: "3px 8px",
              }}
            >
              <span style={{ color: c.textMuted }}>{k}</span>
              <span
                style={{
                  fontWeight: 700,
                  color: v.includes("↓") ? c.error : v.includes("↑") ? c.success : c.text,
                }}
              >
                {v}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: "0 28px 24px", display: "flex", flexDirection: "column", gap: 8 }}>
        {opts.map((o, i) => {
          const isCrossed = crossed.includes(o);
          const isSelected = selected === o;
          return (
            <div key={o} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <button
                onClick={() => setSelected(o)}
                style={{
                  flex: 1,
                  textAlign: "left",
                  padding: "12px 16px",
                  borderRadius: 10,
                  border: `1.5px solid ${isSelected ? c.primary : c.border}`,
                  background: isSelected ? c.primaryLight : c.white,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                  opacity: isCrossed ? 0.35 : 1,
                  transition: "all 0.15s",
                }}
              >
                <span
                  style={{
                    minWidth: 26,
                    height: 26,
                    borderRadius: 6,
                    background: isSelected ? c.primary : c.border,
                    color: isSelected ? "#fff" : c.text,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    fontSize: 13,
                  }}
                >
                  {o}
                </span>
                <span
                  style={{
                    fontSize: 14,
                    lineHeight: 1.6,
                    color: c.text,
                    textDecoration: isCrossed ? "line-through" : "none",
                  }}
                >
                  {labels[i]}
                </span>
              </button>
              <button
                onClick={() => toggleCross(o)}
                title="Cross out"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  border: `1.5px solid ${c.border}`,
                  background: isCrossed ? "#fee2e2" : c.white,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 15,
                  marginTop: 4,
                  flexShrink: 0,
                }}
              >
                ✕
              </button>
            </div>
          );
        })}
        <button
          onClick={onSubmit}
          disabled={!selected}
          style={{
            marginTop: 8,
            padding: "13px",
            borderRadius: 10,
            border: "none",
            background: selected ? c.primary : c.neutralLight,
            color: selected ? "#fff" : c.textMuted,
            fontWeight: 700,
            fontSize: 15,
            cursor: selected ? "pointer" : "default",
            transition: "all 0.2s",
          }}
        >
          Submit Answer
        </button>
      </div>
    </Card>
  );
}
