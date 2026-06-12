"use client";

import { useState } from "react";
import { useThemedColors } from "./useThemedColors";
import { Card } from "./Card";

export function Flashcard() {
  const c = useThemedColors();
  const [flipped, setFlipped] = useState(false);
  const [rating, setRating] = useState<string | null>(null);

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
          Flashcards
        </div>
        <span style={{ fontSize: 12, color: c.textMuted }}>Card 7 of 42</span>
      </div>
      <div
        style={{
          padding: 28,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          onClick={() => setFlipped(!flipped)}
          style={{
            width: "100%",
            minHeight: 180,
            borderRadius: 14,
            border: `1.5px solid ${flipped ? "#a7f3d0" : c.border}`,
            background: flipped ? c.successLight : c.primaryLight,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            cursor: "pointer",
            textAlign: "center",
            transition: "all 0.25s",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 12,
              left: 16,
              fontSize: 10,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: flipped ? c.success : c.primary,
            }}
          >
            {flipped ? "Answer" : "Question"}
          </div>
          <div
            style={{
              fontSize: 15,
              color: c.text,
              lineHeight: 1.7,
              fontFamily: "Georgia, serif",
            }}
          >
            {!flipped ? (
              "What enzyme is deficient in a patient presenting with hemolytic anemia after primaquine exposure, Heinz bodies, and bite cells on peripheral smear?"
            ) : (
              <>
                <strong style={{ color: c.success }}>
                  Glucose-6-Phosphate Dehydrogenase (G6PD)
                </strong>
                <br />
                <span style={{ fontSize: 13, color: c.textMuted }}>
                  X-linked recessive · Oxidative hemolysis · NADPH ↓ → Glutathione ↓
                </span>
              </>
            )}
          </div>
          <div
            style={{
              position: "absolute",
              bottom: 12,
              right: 16,
              fontSize: 11,
              color: c.textMuted,
            }}
          >
            Tap to {flipped ? "hide" : "reveal"}
          </div>
        </div>
        {flipped && (
          <div
            style={{
              display: "flex",
              gap: 10,
              marginTop: 20,
              width: "100%",
            }}
          >
            {[
              ["Again", c.error, c.errorLight],
              ["Hard", c.warning, c.warningLight],
              ["Good", c.success, c.successLight],
              ["Easy", c.primary, c.primaryLight],
            ].map(([label, btnColor, btnBg]) => (
              <button
                key={label}
                onClick={() => setRating(label)}
                style={{
                  flex: 1,
                  padding: "10px 0",
                  borderRadius: 10,
                  border: `1.5px solid ${rating === label ? btnColor : c.border}`,
                  background: rating === label ? btnBg : c.white,
                  color: btnColor,
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
