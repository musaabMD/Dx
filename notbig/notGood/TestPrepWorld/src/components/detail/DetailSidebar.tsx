import Link from "next/link";
import type { Exam } from "@/types/exam";

const SECTIONS = [
  { id: "dashboard", icon: "🏠", label: "Dashboard" },
  { id: "quiz", icon: "✏️", label: "Quiz" },
  { id: "flashcards", icon: "🃏", label: "Flashcards" },
  { id: "review", icon: "📋", label: "Review" },
  { id: "analytics", icon: "📈", label: "Analytics" },
  { id: "ai-tutor", icon: "🤖", label: "AI Tutor" },
  { id: "subjects", icon: "📚", label: "Subjects" },
  { id: "notes", icon: "📝", label: "Notes" },
  { id: "community", icon: "💬", label: "Community" },
  { id: "experiences", icon: "🏆", label: "Experiences" },
];

interface DetailSidebarProps {
  exam: Exam;
  section: string;
  onSectionChange: (id: string) => void;
  onBack?: () => void;
  backHref?: string;
  t: {
    sidebar: string;
    border: string;
    subtext: string;
    muted: string;
  };
}

export function DetailSidebar({
  exam,
  section,
  onSectionChange,
  onBack,
  backHref,
  t,
}: DetailSidebarProps) {
  const BackComponent = backHref ? (
    <Link
      href={backHref}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        background: "none",
        border: "none",
        color: t.subtext,
        fontFamily: "'DM Mono', monospace",
        fontSize: "13px",
        cursor: "pointer",
        padding: "0 0 14px",
        letterSpacing: "0.04em",
        textDecoration: "none",
      }}
    >
      ← back
    </Link>
  ) : (
    <button
      onClick={onBack}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        background: "none",
        border: "none",
        color: t.subtext,
        fontFamily: "'DM Mono', monospace",
        fontSize: "13px",
        cursor: "pointer",
        padding: "0 0 14px",
        letterSpacing: "0.04em",
      }}
    >
      ← back
    </button>
  );

  return (
    <div
      style={{
        width: "200px",
        flexShrink: 0,
        background: t.sidebar,
        borderRight: `1px solid ${t.border}`,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <div style={{ padding: "20px 16px 16px" }}>
        {BackComponent}
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "10px",
            background: exam.color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "'Bebas Neue', cursive",
            fontSize: "16px",
            color: "white",
            letterSpacing: "0.05em",
            marginBottom: "10px",
            boxShadow: `0 4px 16px ${exam.color}55`,
          }}
        >
          {exam.name.slice(0, 3).toUpperCase()}
        </div>
        <div style={{ fontWeight: 900, fontSize: "16px", lineHeight: 1 }}>
          {exam.name}
        </div>
        <div
          style={{
            fontSize: "12px",
            color: t.subtext,
            fontFamily: "'DM Mono', monospace",
            marginTop: "4px",
          }}
        >
          {exam.community}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "8px" }}>
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "#1ed760",
              boxShadow: "0 0 5px #1ed760",
              display: "inline-block",
            }}
          />
          <span style={{ fontSize: "11px", fontFamily: "'DM Mono', monospace", color: t.muted }}>
            {exam.online.toLocaleString()} online
          </span>
        </div>
      </div>

      <div style={{ height: "1px", background: t.border, margin: "0 12px" }} />

      <div style={{ padding: "12px 8px", flex: 1, overflowY: "auto" }}>
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            onClick={() => onSectionChange(s.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              width: "100%",
              padding: "8px 10px",
              borderRadius: "6px",
              background: section === s.id ? `${exam.color}22` : "none",
              border: "none",
              cursor: "pointer",
              color: section === s.id ? exam.color : t.subtext,
              fontFamily: "'Bricolage Grotesque', sans-serif",
              fontSize: "13px",
              fontWeight: section === s.id ? 700 : 500,
              textAlign: "left",
              transition: "all 0.15s",
            }}
          >
            <span style={{ fontSize: "14px", opacity: 0.9 }}>{s.icon}</span>
            <span>{s.label}</span>
          </button>
        ))}
      </div>

      <div
        style={{
          padding: "12px 16px",
          borderTop: `1px solid ${t.border}`,
          fontSize: "11px",
          fontFamily: "'DM Mono', monospace",
          color: t.muted,
        }}
      >
        <div style={{ marginBottom: "4px" }}>👥 {exam.members} members</div>
        <div style={{ marginBottom: "4px" }}>❓ {exam.questions.toLocaleString()} questions</div>
        <div>📊 {exam.passRate}% pass rate</div>
      </div>
    </div>
  );
}
