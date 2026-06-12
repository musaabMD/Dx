"use client";

import { useState, useEffect } from "react";
import { useThemedColors } from "./useThemedColors";
import { Card } from "./Card";

export function TimedExamBanner() {
  const c = useThemedColors();
  const [time, setTime] = useState(3600);

  useEffect(() => {
    const t = setInterval(() => setTime((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);

  const mm = String(Math.floor(time / 60)).padStart(2, "0");
  const ss = String(time % 60).padStart(2, "0");
  const pct = (time / 3600) * 100;

  return (
    <Card>
      <div
        style={{
          padding: "20px 28px",
          background:
            time < 300
              ? "#fee2e2"
              : "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
          color: "#fff",
          borderRadius: 16,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                opacity: 0.75,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              Self-Assessment Exam
            </div>
            <div style={{ fontSize: 22, fontWeight: 900, marginTop: 4 }}>
              USMLE Step 1 Block 3
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: 40,
                fontWeight: 900,
                fontFamily: "monospace",
                color: time < 300 ? c.error : "#fff",
              }}
            >
              {mm}:{ss}
            </div>
            <div style={{ fontSize: 11, opacity: 0.7 }}>Remaining</div>
          </div>
        </div>
        <div
          style={{
            height: 6,
            background: "rgba(255,255,255,0.15)",
            borderRadius: 10,
            overflow: "hidden",
            marginBottom: 14,
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${pct}%`,
              background: time < 300 ? c.error : "#22d3ee",
              borderRadius: 10,
              transition: "width 1s linear",
            }}
          />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: 12, opacity: 0.75 }}>Question 12 / 40</span>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              style={{
                padding: "6px 16px",
                borderRadius: 8,
                border: "1.5px solid rgba(255,255,255,0.3)",
                background: "transparent",
                color: "#fff",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Pause
            </button>
            <button
              style={{
                padding: "6px 16px",
                borderRadius: 8,
                border: "none",
                background: "#22d3ee",
                color: "#0f2027",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              End Block
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}
