"use client";

import { useState } from "react";
import { useTheme } from "@/hooks/useTheme";
import { ExamCard } from "./ExamCard";
import { exams } from "@/data/exams";

interface BrowsePageProps {
  dark: boolean;
  setDark: (fn: (d: boolean) => boolean) => void;
}

export function BrowsePage({ dark, setDark }: BrowsePageProps) {
  const t = useTheme(dark);
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState("All");
  const tags = ["All", "College", "Medical", "Law", "Business", "Finance"];

  const filtered = exams.filter((e) => {
    const s = search.toLowerCase();
    const matchSearch =
      e.name.toLowerCase().includes(s) ||
      e.community.toLowerCase().includes(s);
    const matchTag =
      activeTag === "All" ||
      (activeTag === "College" &&
        e.community.toLowerCase().includes("college")) ||
      (activeTag === "Medical" &&
        e.community.toLowerCase().includes("medic")) ||
      (activeTag === "Law" && e.community.toLowerCase().includes("law")) ||
      (activeTag === "Business" &&
        e.community.toLowerCase().includes("business")) ||
      (activeTag === "Finance" &&
        e.community.toLowerCase().includes("financ"));
    return matchSearch && matchTag;
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        background: t.bg,
        color: t.text,
        fontFamily: "'Bricolage Grotesque', sans-serif",
        transition: "background 0.3s, color 0.3s",
      }}
    >
      {/* Header with theme switch */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 40px",
          borderBottom: `1px solid ${t.border}`,
          background: dark ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.5)",
        }}
      >
        <h1
          style={{
            fontFamily: "'Bricolage Grotesque', sans-serif",
            fontSize: "22px",
            fontWeight: 900,
            letterSpacing: "-0.02em",
          }}
        >
          TestPrepWorld
        </h1>
        <button
          onClick={() => setDark((d) => !d)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            background: dark
              ? "rgba(255,255,255,0.12)"
              : "rgba(0,0,0,0.08)",
            border: `1px solid ${t.border}`,
            borderRadius: "10px",
            padding: "10px 20px",
            cursor: "pointer",
            color: t.text,
            fontFamily: "'DM Mono', monospace",
            fontSize: "13px",
            fontWeight: 700,
            letterSpacing: "0.05em",
            transition: "all 0.2s",
          }}
        >
          <span style={{ fontSize: "18px" }}>{dark ? "☀️" : "🌙"}</span>
          {dark ? "Light mode" : "Dark mode"}
        </button>
      </header>

      <div
        style={{
          maxWidth: "1600px",
          margin: "0 auto",
          padding: "40px 48px 96px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginBottom: "32px",
          }}
        >
          <h2
            style={{
              fontFamily: "'Bricolage Grotesque', sans-serif",
              fontSize: "clamp(26px,4.5vw,40px)",
              fontWeight: 900,
              letterSpacing: "-0.03em",
              lineHeight: 1,
              textAlign: "center",
            }}
          >
            Browse Exams
          </h2>
          <p
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: "13px",
              color: t.subtext,
              marginTop: "10px",
              textAlign: "center",
            }}
          >
            1,000+ standardized tests
          </p>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "28px",
          }}
        >
          <div
            style={{
              position: "relative",
              width: "100%",
              maxWidth: "460px",
            }}
          >
            <svg
              style={{
                position: "absolute",
                left: "16px",
                top: "50%",
                transform: "translateY(-50%)",
                opacity: 0.32,
                pointerEvents: "none",
              }}
              width="15"
              height="15"
              viewBox="0 0 16 16"
              fill={t.text}
            >
              <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.868-3.834zm-5.242 1.406a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11z" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search exams..."
              style={{
                width: "100%",
                padding: "13px 18px 13px 42px",
                background: dark
                  ? "rgba(255,255,255,0.1)"
                  : "rgba(0,0,0,0.07)",
                border: "none",
                borderRadius: "100px",
                color: t.text,
                fontSize: "13px",
                fontFamily: "'DM Mono', monospace",
                outline: "none",
                transition: "background 0.25s",
              }}
            />
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: "10px",
            marginBottom: "40px",
          }}
        >
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              style={{
                padding: "7px 18px",
                borderRadius: "100px",
                border: "none",
                background:
                  activeTag === tag
                    ? dark
                      ? "white"
                      : "#121212"
                    : dark
                      ? "rgba(255,255,255,0.1)"
                      : "rgba(0,0,0,0.07)",
                color:
                  activeTag === tag ? (dark ? "#121212" : "white") : t.subtext,
                fontFamily: "'DM Mono', monospace",
                fontSize: "11.5px",
                fontWeight: 700,
                letterSpacing: "0.04em",
                cursor: "pointer",
                transition: "all 0.18s",
              }}
            >
              {tag}
            </button>
          ))}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "24px",
          }}
        >
          {filtered.map((exam, i) => (
            <div
              key={exam.id}
              style={{
                animation: `fadeUp 0.35s ease ${i * 0.04}s both`,
              }}
            >
              <ExamCard exam={exam} />
            </div>
          ))}
        </div>
        {filtered.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "72px 0",
              fontFamily: "'DM Mono', monospace",
              fontSize: "13px",
              color: t.subtext,
            }}
          >
            No exams found for &quot;{search}&quot;
          </div>
        )}
      </div>
    </div>
  );
}
