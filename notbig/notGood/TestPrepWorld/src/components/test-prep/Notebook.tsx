"use client";

import { useState } from "react";
import { useThemedColors } from "./useThemedColors";
import { Card } from "./Card";

const defaultNote = `G6PD deficiency:
• X-linked recessive
• Triggered by: primaquine, dapsone, fava beans, infections
• Smear: Heinz bodies, bite cells
• Labs: ↑ LDH, ↑ indirect bili, ↓ haptoglobin`;

export function Notebook() {
  const c = useThemedColors();
  const [note, setNote] = useState(defaultNote);

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
        <div
          style={{
            fontSize: 16,
            fontWeight: 800,
            color: c.text,
            fontFamily: "Georgia, serif",
          }}
        >
          📝 Notebook
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {["B", "I", "U"].map((f) => (
            <button
              key={f}
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                border: `1px solid ${c.border}`,
                background: c.white,
                fontWeight: 700,
                cursor: "pointer",
                fontSize: 13,
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
      <div style={{ padding: "16px 24px" }}>
        <div
          style={{
            fontSize: 11,
            color: c.textMuted,
            marginBottom: 8,
          }}
        >
          Q12 • Hematology • G6PD Deficiency
        </div>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          style={{
            width: "100%",
            minHeight: 140,
            border: `1px solid ${c.border}`,
            borderRadius: 10,
            padding: "12px 14px",
            fontSize: 13,
            lineHeight: 1.7,
            color: c.text,
            resize: "vertical",
            fontFamily: "inherit",
            outline: "none",
            background: "#fffde7",
            boxSizing: "border-box",
          }}
        />
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
          <button
            style={{
              padding: "8px 20px",
              borderRadius: 8,
              border: "none",
              background: c.primary,
              color: "#fff",
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            Save Note
          </button>
        </div>
      </div>
    </Card>
  );
}
