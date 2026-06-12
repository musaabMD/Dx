"use client";

import { useState } from "react";
import { useThemedColors } from "./useThemedColors";
import { Card } from "./Card";

const optionExplanations = [
  "Pyruvate kinase deficiency causes chronic hemolytic anemia but does NOT cause Heinz bodies.",
  "Hereditary spherocytosis presents with spherocytes, not bite cells, and is caused by spectrin defect.",
  "G6PD deficiency causes oxidative hemolysis with Heinz bodies and bite cells — matches the scenario perfectly.",
  "Sickle cell anemia causes vaso-occlusive crises; does not cause Heinz bodies.",
  "Iron deficiency causes microcytic hypochromic anemia, not hemolytic anemia.",
];

const statsVals = [8, 12, 64, 10, 6];

interface ExplanationScreenProps {
  onPrevious?: () => void;
  onNext?: () => void;
}

export function ExplanationScreen({ onPrevious, onNext }: ExplanationScreenProps) {
  const c = useThemedColors();
  const [tab, setTab] = useState("explanation");

  return (
    <Card>
      <div
        style={{
          padding: "16px 24px",
          background: c.successLight,
          borderBottom: "1px solid #a7f3d0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: c.success,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 800,
              fontSize: 16,
            }}
          >
            ✓
          </div>
          <div>
            <div style={{ fontWeight: 800, color: c.success, fontSize: 15 }}>
              Correct Answer: C
            </div>
            <div style={{ fontSize: 12, color: "#047857" }}>
              G6PD deficiency results in Heinz body formation after oxidative stress.
            </div>
          </div>
        </div>
        <div style={{ fontSize: 12, color: c.textMuted }}>
          64% of users answered correctly
        </div>
      </div>
      <div
        style={{
          display: "flex",
          borderBottom: `1px solid ${c.border}`,
          padding: "0 24px",
        }}
      >
        {["explanation", "options", "stats"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: "12px 18px",
              fontWeight: 700,
              fontSize: 13,
              border: "none",
              background: "none",
              borderBottom:
                tab === t ? `2.5px solid ${c.primary}` : "2.5px solid transparent",
              color: tab === t ? c.primary : c.textMuted,
              cursor: "pointer",
              textTransform: "capitalize",
            }}
          >
            {t}
          </button>
        ))}
      </div>
      <div style={{ padding: "24px 28px" }}>
        {tab === "explanation" && (
          <div>
            <div
              style={{
                background: "#eff6ff",
                border: "1px solid #bfdbfe",
                borderRadius: 10,
                padding: "14px 18px",
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  fontWeight: 800,
                  fontSize: 13,
                  color: c.primary,
                  marginBottom: 6,
                }}
              >
                🔑 Key Concept: G6PD Deficiency
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: c.text, margin: 0 }}>
                Glucose-6-phosphate dehydrogenase (G6PD) deficiency is an X-linked recessive
                disorder that impairs the pentose phosphate pathway. Without adequate NADPH,
                glutathione cannot be regenerated, leaving hemoglobin vulnerable to oxidative
                denaturation.
              </p>
            </div>
            <p
              style={{
                fontSize: 14,
                lineHeight: 1.8,
                color: c.text,
                marginBottom: 16,
              }}
            >
              Under oxidative stress (e.g., primaquine, dapsone, infection), hemoglobin
              becomes denatured and precipitates as <strong>Heinz bodies</strong>, which are
              removed by splenic macrophages, leaving <strong>bite cells</strong> on the
              smear. This causes <strong>intravascular and extravascular hemolysis</strong>.
            </p>
            <div
              style={{
                background: c.neutralLight,
                borderRadius: 10,
                padding: "14px 18px",
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 13,
                  color: c.text,
                  marginBottom: 8,
                }}
              >
                Clinical Pearl 💡
              </div>
              <ul
                style={{
                  margin: 0,
                  paddingLeft: 20,
                  fontSize: 13,
                  lineHeight: 1.8,
                  color: c.text,
                }}
              >
                <li>Most common enzyme deficiency worldwide</li>
                <li>Affects mainly males (X-linked)</li>
                <li>Screen before starting primaquine or dapsone</li>
                <li>Dx: G6PD enzyme assay (wait for hemolysis to resolve)</li>
              </ul>
            </div>
          </div>
        )}
        {tab === "options" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {["A", "B", "C", "D", "E"].map((o, i) => {
              const correct = o === "C";
              return (
                <div
                  key={o}
                  style={{
                    padding: "12px 16px",
                    borderRadius: 10,
                    border: `1.5px solid ${correct ? "#a7f3d0" : c.border}`,
                    background: correct ? c.successLight : c.white,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      marginBottom: 4,
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 800,
                        fontSize: 13,
                        color: correct ? c.success : c.textMuted,
                      }}
                    >
                      {o}
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: correct ? c.success : c.error,
                      }}
                    >
                      {correct ? "✓ Correct" : "✗ Incorrect"}
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: 13,
                      lineHeight: 1.6,
                      color: c.text,
                      margin: 0,
                    }}
                  >
                    {optionExplanations[i]}
                  </p>
                </div>
              );
            })}
          </div>
        )}
        {tab === "stats" && (
          <div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: c.text,
                marginBottom: 16,
              }}
            >
              How others answered
            </div>
            {["A", "B", "C", "D", "E"].map((o, i) => (
              <div
                key={o}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 10,
                }}
              >
                <span
                  style={{
                    width: 20,
                    fontWeight: 800,
                    fontSize: 13,
                    color: c.textMuted,
                  }}
                >
                  {o}
                </span>
                <div
                  style={{
                    flex: 1,
                    height: 28,
                    background: c.neutralLight,
                    borderRadius: 6,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${statsVals[i]}%`,
                      background: o === "C" ? c.success : c.border,
                      borderRadius: 6,
                      transition: "width 0.6s ease",
                      display: "flex",
                      alignItems: "center",
                      paddingLeft: 8,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: o === "C" ? "#fff" : c.textMuted,
                      }}
                    >
                      {statsVals[i]}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div
        style={{
          padding: "0 28px 24px",
          display: "flex",
          gap: 10,
        }}
      >
        <button
          onClick={onPrevious}
          style={{
            flex: 1,
            padding: "11px",
            borderRadius: 10,
            border: `1.5px solid ${c.border}`,
            background: c.white,
            fontWeight: 700,
            fontSize: 14,
            cursor: "pointer",
            color: c.text,
          }}
        >
          ← Previous
        </button>
        <button
          onClick={onNext}
          style={{
            flex: 1,
            padding: "11px",
            borderRadius: 10,
            border: "none",
            background: c.primary,
            color: "#fff",
            fontWeight: 700,
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          Next Question →
        </button>
      </div>
    </Card>
  );
}
