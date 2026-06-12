"use client";

import { useThemedColors } from "./useThemedColors";
import { Label } from "./Label";
import { Card } from "./Card";

const options = [
  "Deletion of alpha-globin genes",
  "Point mutation: Glu→Val at position 6 of beta-globin",
  "Premature stop codon in HBB gene",
  "Frameshift mutation in alpha-globin",
];

export function ImageQuestion() {
  const c = useThemedColors();
  return (
    <Card>
      <div
        style={{
          padding: "16px 24px",
          borderBottom: `1px solid ${c.border}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontSize: 15,
            fontWeight: 800,
            color: c.text,
            fontFamily: "Georgia, serif",
          }}
        >
          Image-Based Question
        </span>
        <Label text="Pathology" />
      </div>
      <div style={{ padding: "20px 24px" }}>
        <div
          style={{
            width: "100%",
            height: 180,
            borderRadius: 12,
            background: "linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid #c7d2fe",
            marginBottom: 16,
          }}
        >
          <div style={{ fontSize: 48 }}>🔬</div>
          <div
            style={{
              fontSize: 13,
              color: "#4338ca",
              fontWeight: 700,
              marginTop: 8,
            }}
          >
            Peripheral Blood Smear
          </div>
          <div style={{ fontSize: 11, color: "#6366f1", marginTop: 4 }}>
            400× Magnification
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            {["🔴 Sickle cells", "⭕ Target cells", "🔵 Bite cells"].map((item) => (
              <span
                key={item}
                style={{
                  fontSize: 11,
                  background: "rgba(255,255,255,0.7)",
                  padding: "3px 8px",
                  borderRadius: 10,
                  color: "#312e81",
                }}
              >
                {item}
              </span>
            ))}
          </div>
        </div>
        <p
          style={{
            fontSize: 14,
            lineHeight: 1.7,
            color: c.text,
            marginBottom: 14,
            fontFamily: "Georgia, serif",
          }}
        >
          The peripheral blood smear shown is from a 28-year-old male who presents with
          painful swelling of both hands. Which genetic mutation is responsible for this
          finding?
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
              border: `1.5px solid ${c.border}`,
              background: c.white,
              color: c.text,
              fontSize: 13,
              fontWeight: 500,
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
