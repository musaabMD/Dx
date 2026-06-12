"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

function ExamCard({ exam, index }) {
  const fallback = { bg: "#E4E4E7", color: "#18181B" };
  const bg = exam.bg || fallback.bg;
  const color = exam.color || fallback.color;
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setPressed(false);
      }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      style={{
        background: bg,
        borderRadius: 14,
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
        padding: "20px 18px",
        minHeight: 120,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        transition: "transform 0.2s cubic-bezier(.4,0,.2,1), box-shadow 0.2s cubic-bezier(.4,0,.2,1)",
        transform: pressed ? "scale(0.97)" : hovered ? "translateY(-2px)" : "none",
        boxShadow: hovered ? `0 12px 32px -6px ${bg}55` : "none",
        animation: `cardPop 0.35s cubic-bezier(.4,0,.2,1) ${index * 0.035}s both`,
      }}
    >
      <h3
        style={{
          fontSize: 16,
          fontWeight: 700,
          color: "#fff",
          lineHeight: 1.3,
          margin: 0,
          paddingRight: 10,
        }}
      >
        {exam.name}
      </h3>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginTop: 12,
        }}
      >
        <div
          style={{
            background: "rgba(255,255,255,0.92)",
            padding: "4px 10px",
            borderRadius: 5,
            transform: "rotate(-4deg)",
            boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
          }}
        >
          <span
            style={{
              fontSize: 11,
              fontWeight: 800,
              color: exam.color,
              letterSpacing: "0.03em",
            }}
          >
            {exam.abbr || "EXAM"}
          </span>
        </div>
      </div>
    </div>
  );
}

function toSlug(input) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function App() {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);
  const exams = useQuery(api.exams.list) ?? [];
  useEffect(() => {
    document.documentElement.style.setProperty("--page-bg", "#F8F8F7");
    document.body.style.background = "#F8F8F7";
  }, []);

  const filtered = exams.filter(
    (e) =>
      !query ||
      e.name.toLowerCase().includes(query.toLowerCase()) ||
      e.abbr.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F8F8F7",
        fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        color: "#18181B",
        "--page-bg": "#F8F8F7",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap"
        rel="stylesheet"
      />

      <main style={{ maxWidth: 960, margin: "0 auto", padding: "0 16px" }}>
        <div
          style={{
            paddingTop: "max(6vh, 36px)",
            textAlign: "center",
            animation: "fadeDown 0.4s cubic-bezier(.4,0,.2,1) both",
          }}
        >
          <h1
            style={{
              fontSize: "clamp(22px, 5.5vw, 34px)",
              fontWeight: 800,
              letterSpacing: "-0.04em",
              color: "#18181B",
              margin: 0,
              lineHeight: 1.15,
            }}
          >
            Ace Your Exam
          </h1>
          <p
            style={{
              fontSize: "clamp(13px, 2.2vw, 15px)",
              color: "#71717A",
              margin: "6px 0 0",
              fontWeight: 400,
            }}
          >
            Start preparing with AI-powered study tools
          </p>
        </div>

        <div
          style={{
            maxWidth: 540,
            margin: "20px auto 0",
            animation: "fadeDown 0.4s cubic-bezier(.4,0,.2,1) 0.05s both",
          }}
        >
          <div
            style={{
              borderRadius: 16,
              border: focused ? "2px solid #18181B" : "2px solid #E4E4E7",
              background: "#fff",
              transition: "border-color 0.2s, box-shadow 0.2s",
              boxShadow: focused
                ? "0 0 0 4px rgba(24,24,27,0.05), 0 4px 20px rgba(0,0,0,0.05)"
                : "0 1px 6px rgba(0,0,0,0.03)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", padding: "0 14px 0 20px" }}>
              <Search
                size={21}
                strokeWidth={2}
                style={{
                  color: focused ? "#18181B" : "#A1A1AA",
                  transition: "color 0.15s",
                  flexShrink: 0,
                }}
              />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search exams by name or abbreviation"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                style={{
                  flex: 1,
                  padding: "20px 12px",
                  fontSize: 16,
                  fontFamily: "inherit",
                  fontWeight: 400,
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "#18181B",
                  minWidth: 0,
                }}
              />
              {query && (
                <button
                  onClick={() => {
                    setQuery("");
                    inputRef.current?.focus();
                  }}
                  style={{
                    background: "#F4F4F5",
                    border: "none",
                    borderRadius: 9,
                    width: 34,
                    height: 34,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#52525B",
                    flexShrink: 0,
                  }}
                >
                  <X size={14} strokeWidth={2.5} />
                </button>
              )}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 28, paddingBottom: 48 }}>
          {filtered.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "48px 20px",
                animation: "fadeDown 0.3s ease both",
              }}
            >
              <Search
                size={26}
                strokeWidth={1.5}
                style={{ marginBottom: 8, opacity: 0.3, color: "#A1A1AA" }}
              />
              <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: "#52525B" }}>
                No exams match "{query}"
              </p>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: "#A1A1AA" }}>
                Try a different name or abbreviation
              </p>
            </div>
          ) : (
            <div className="exam-grid">
              {filtered.map((exam, i) => {
                const slug = exam.slug || toSlug(exam.name);
                return (
                  <Link
                    key={exam.abbr || exam.name}
                    href={`/exams/${encodeURIComponent(slug)}`}
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <ExamCard exam={exam} index={i} />
                  </Link>
                );
              })}
            </div>
          )}

          {filtered.length > 0 && (
            <p
              style={{
                textAlign: "center",
                marginTop: 20,
                fontSize: 12,
                color: "#A1A1AA",
              }}
            >
              {filtered.length} exam{filtered.length !== 1 ? "s" : ""} available
            </p>
          )}
        </div>
      </main>

      <style>{`
        @keyframes fadeDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes cardPop {
          from { opacity: 0; transform: translateY(10px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        ::placeholder { color: #A1A1AA !important; }
        * { box-sizing: border-box; margin: 0; }
        .btn-upgrade:hover { background: #27272A !important; border-color: #27272A !important; }
        .btn-gs:hover { background: rgba(24,24,27,0.1) !important; border-color: rgba(24,24,27,0.2) !important; }

        .exam-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }
        @media (min-width: 540px) {
          .exam-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
          }
        }
        @media (min-width: 380px) and (max-width: 539px) {
          .exam-grid {
            gap: 10px;
          }
        }
        @media (max-width: 360px) {
          .btn-gs { display: none !important; }
        }
      `}</style>
    </div>
  );
}
