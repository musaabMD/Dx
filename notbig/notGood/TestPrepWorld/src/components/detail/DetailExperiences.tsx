"use client";

import { useState } from "react";
import type { Exam } from "@/types/exam";
import type { Experience } from "@/types/exam";
import { Avatar } from "@/components/ui/Avatar";
import { StarRating } from "@/components/ui/StarRating";

interface DetailExperiencesProps {
  exam: Exam;
  t: {
    subtext: string;
    surface: string;
    border: string;
    text: string;
    inputBg: string;
  };
}

export function DetailExperiences({ exam, t }: DetailExperiencesProps) {
  const [experienceText, setExperienceText] = useState("");
  const [experienceScore, setExperienceScore] = useState("");
  const [experiences, setExperiences] = useState<Experience[]>(exam.experiences);
  const [expRating, setExpRating] = useState(5);

  return (
    <div style={{ maxWidth: "680px", animation: "fadeUp 0.3s ease" }}>
      <div
        style={{
          fontSize: "22px",
          fontWeight: 900,
          letterSpacing: "-0.02em",
          marginBottom: "6px",
        }}
      >
        Exam Experiences
      </div>
      <div
        style={{
          fontSize: "12px",
          color: t.subtext,
          fontFamily: "'DM Mono', monospace",
          marginBottom: "20px",
        }}
      >
        Real stories from people who took {exam.name}
      </div>

      <div
        style={{
          background: t.surface,
          borderRadius: "12px",
          border: `1px solid ${t.border}`,
          marginBottom: "28px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "16px 18px 0",
            fontSize: "13px",
            fontWeight: 700,
            color: t.text,
          }}
        >
          Share Your Experience
        </div>
        <div
          style={{
            padding: "12px 18px",
            display: "flex",
            gap: "10px",
          }}
        >
          <input
            value={experienceScore}
            onChange={(e) => setExperienceScore(e.target.value)}
            placeholder="Your score (e.g. 1450/1600)"
            style={{
              flex: "0 0 180px",
              padding: "9px 14px",
              background: t.inputBg,
              border: `1px solid ${t.border}`,
              borderRadius: "8px",
              color: t.text,
              outline: "none",
              fontFamily: "'DM Mono', monospace",
              fontSize: "12px",
            }}
          />
          <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                onClick={() => setExpRating(s)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "20px",
                  color: s <= expRating ? "#fbbf24" : t.text,
                  transition: "color 0.15s",
                  padding: "0 2px",
                }}
              >
                ★
              </button>
            ))}
          </div>
        </div>
        <div style={{ padding: "0 18px" }}>
          <textarea
            value={experienceText}
            onChange={(e) => setExperienceText(e.target.value)}
            placeholder={`How was your ${exam.name} experience? Tips, surprises, what worked…`}
            rows={3}
            style={{
              width: "100%",
              padding: "12px 14px",
              background: t.inputBg,
              border: `1px solid ${t.border}`,
              borderRadius: "8px",
              color: t.text,
              resize: "none",
              outline: "none",
              fontFamily: "'Bricolage Grotesque', sans-serif",
              fontSize: "14px",
              lineHeight: 1.5,
              boxSizing: "border-box",
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            padding: "12px 18px",
          }}
        >
          <button
            onClick={() => {
              if (!experienceText.trim()) return;
              setExperiences((prev) => [
                {
                  user: "You",
                  avatar: "ME",
                  score: experienceScore || "N/A",
                  date: "just now",
                  text: experienceText,
                  rating: expRating,
                },
                ...prev,
              ]);
              setExperienceText("");
              setExperienceScore("");
              setExpRating(5);
            }}
            style={{
              padding: "8px 20px",
              borderRadius: "100px",
              border: "none",
              background: exam.color,
              color: "white",
              fontFamily: "'DM Mono', monospace",
              fontSize: "11px",
              fontWeight: 700,
              cursor: "pointer",
              letterSpacing: "0.05em",
            }}
          >
            SHARE
          </button>
        </div>
      </div>

      {experiences.map((exp, i) => (
        <div
          key={i}
          style={{
            background: t.surface,
            borderRadius: "12px",
            padding: "20px",
            border: `1px solid ${t.border}`,
            marginBottom: "12px",
            animation: `fadeUp 0.3s ease ${i * 0.07}s both`,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "12px",
            }}
          >
            <Avatar initials={exp.avatar} color={exam.color} size={38} />
            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <span style={{ fontWeight: 800, fontSize: "14px" }}>
                  {exp.user}
                </span>
                <span
                  style={{
                    padding: "2px 10px",
                    borderRadius: "100px",
                    background: `${exam.color}22`,
                    color: exam.color,
                    fontFamily: "'DM Mono', monospace",
                    fontSize: "10px",
                    fontWeight: 700,
                  }}
                >
                  {exp.score}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginTop: "2px",
                }}
              >
                <StarRating rating={exp.rating} />
                <span
                  style={{
                    fontSize: "10px",
                    color: t.subtext,
                    fontFamily: "'DM Mono', monospace",
                  }}
                >
                  {exp.date}
                </span>
              </div>
            </div>
          </div>
          <div
            style={{ fontSize: "14px", lineHeight: 1.7, color: t.text }}
          >
            {exp.text}
          </div>
        </div>
      ))}
    </div>
  );
}
