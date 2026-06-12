"use client";

import { useThemedColors } from "./useThemedColors";
import { Label } from "./Label";
import { Card } from "./Card";

export function ScorePredictor() {
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
          Predicted Score
        </div>
      </div>
      <div style={{ padding: "24px 28px", textAlign: "center" }}>
        <div
          style={{
            fontSize: 64,
            fontWeight: 900,
            color: c.success,
            lineHeight: 1,
          }}
        >
          242
        </div>
        <div
          style={{
            fontSize: 13,
            color: c.textMuted,
            marginTop: 4,
            marginBottom: 20,
          }}
        >
          Predicted USMLE Step 1 Score
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 8,
            marginBottom: 24,
          }}
        >
          <Label text="Pass" color={c.success} bg={c.successLight} />
          <Label text="Top 15%" color={c.primary} bg={c.primaryLight} />
          <Label
            text="95% CI: 234–250"
            color={c.textMuted}
            bg={c.neutralLight}
          />
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 10,
            marginBottom: 20,
          }}
        >
          {[
            ["Based on", "629 questions"],
            ["Avg Score", "74% correct"],
            ["Percentile", "68th"],
          ].map(([k, v]) => (
            <div
              key={k}
              style={{
                background: c.neutralLight,
                borderRadius: 10,
                padding: "12px",
              }}
            >
              <div style={{ fontSize: 11, color: c.textMuted }}>{k}</div>
              <div
                style={{
                  fontWeight: 800,
                  fontSize: 15,
                  color: c.text,
                  marginTop: 2,
                }}
              >
                {v}
              </div>
            </div>
          ))}
        </div>
        <div
          style={{
            background: c.primaryLight,
            borderRadius: 10,
            padding: "12px 16px",
            textAlign: "left",
          }}
        >
          <div
            style={{
              fontWeight: 700,
              fontSize: 12,
              color: c.primary,
              marginBottom: 6,
            }}
          >
            To reach 250+
          </div>
          <div style={{ fontSize: 12, color: c.text, lineHeight: 1.6 }}>
            Improve Pulmonology (+12pts potential) and Acid-Base Disorders (+8pts). Focus
            on weak areas first.
          </div>
        </div>
      </div>
    </Card>
  );
}
