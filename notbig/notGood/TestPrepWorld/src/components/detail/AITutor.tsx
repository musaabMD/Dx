"use client";

import { useState } from "react";

interface AITutorProps {
  t: { border: string; subtext: string; muted: string };
}

export function AITutor({ t }: AITutorProps) {
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState("");

  const handleAsk = () => {
    if (!question.trim()) return;
    setResponse(
      "Ask me anything about this exam. I can explain concepts, help you work through questions, or clarify topics you're struggling with. (AI integration coming soon.)"
    );
  };

  return (
    <div style={{ maxWidth: 640, margin: "0 auto" }}>
      <div
        style={{
          padding: "24px 28px",
          borderRadius: 16,
          border: `1px solid ${t.border}`,
          background: "rgba(255,255,255,0.03)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 24,
            }}
          >
            🤖
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 18 }}>AI Tutor</div>
            <div style={{ fontSize: 13, color: t.muted }}>
              Get help with any concept or question
            </div>
          </div>
        </div>

        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question about the exam, a concept, or paste a question you're stuck on..."
          style={{
            width: "100%",
            minHeight: 100,
            padding: 14,
            borderRadius: 10,
            border: `1px solid ${t.border}`,
            background: "rgba(0,0,0,0.2)",
            color: "inherit",
            fontSize: 14,
            fontFamily: "inherit",
            resize: "vertical",
            outline: "none",
            boxSizing: "border-box",
          }}
        />

        <button
          onClick={handleAsk}
          style={{
            marginTop: 12,
            padding: "10px 20px",
            borderRadius: 8,
            border: "none",
            background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
            color: "#fff",
            fontWeight: 700,
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          Ask AI Tutor
        </button>

        {response && (
          <div
            style={{
              marginTop: 20,
              padding: 16,
              borderRadius: 10,
              background: "rgba(124, 58, 237, 0.15)",
              border: `1px solid rgba(124, 58, 237, 0.3)`,
              fontSize: 14,
              lineHeight: 1.6,
            }}
          >
            {response}
          </div>
        )}
      </div>
    </div>
  );
}
