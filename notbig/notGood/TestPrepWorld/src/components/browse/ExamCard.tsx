"use client";

import { useState } from "react";
import Link from "next/link";
import type { Exam } from "@/types/exam";
import { examNameToSlug } from "@/lib/exams";
import { TiltedArt } from "./TiltedArt";

interface ExamCardProps {
  exam: Exam;
}

export function ExamCard({ exam }: ExamCardProps) {
  const [hov, setHov] = useState(false);
  const slug = examNameToSlug(exam.name);

  return (
    <Link
      href={`/exams/${slug}`}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className="block"
      style={{
        position: "relative",
        borderRadius: "10px",
        overflow: "hidden",
        cursor: "pointer",
        background: exam.color,
        aspectRatio: "2/1",
        minHeight: "140px",
        padding: "20px 24px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        transition: "transform 0.2s cubic-bezier(.34,1.45,.64,1), filter 0.18s",
        transform: hov ? "scale(1.035)" : "scale(1)",
        filter: hov ? "brightness(1.14)" : "brightness(1)",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.05,
          pointerEvents: "none",
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />
      <div
        style={{
          fontFamily: "'Bebas Neue', cursive",
          fontSize: "clamp(24px,2.8vw,32px)",
          color: "white",
          letterSpacing: "0.04em",
          lineHeight: 1,
          zIndex: 1,
          maxWidth: "62%",
          wordBreak: "break-word",
        }}
      >
        {exam.name}
      </div>
      <div style={{ zIndex: 1 }}>
        <div
          style={{
            fontFamily: "'Bricolage Grotesque', sans-serif",
            fontSize: "15px",
            fontWeight: 600,
            color: "rgba(255,255,255,0.95)",
            marginBottom: "6px",
          }}
        >
          {exam.community}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: "14px",
              color: "rgba(255,255,255,0.8)",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 16 16"
              fill="rgba(255,255,255,0.7)"
            >
              <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm5 7a5 5 0 0 0-10 0h10z" />
            </svg>
            {exam.members}
          </span>
          <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "12px" }}>
            ·
          </span>
          <span
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: "14px",
              color: "rgba(255,255,255,0.9)",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <span
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                background: "#1ed760",
                boxShadow: "0 0 5px #1ed760",
                display: "inline-block",
              }}
            />
            {exam.online.toLocaleString()} online
          </span>
        </div>
      </div>
      <TiltedArt name={exam.name} />
    </Link>
  );
}
