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

interface DetailTopBarProps {
  section: string;
  subtitle: string;
  t: { sidebar: string; border: string; subtext: string };
  isDark?: boolean;
  onToggleTheme?: () => void;
}

export function DetailTopBar({
  section,
  subtitle,
  t,
  isDark = true,
  onToggleTheme,
}: DetailTopBarProps) {
  const current = SECTIONS.find((s) => s.id === section);
  return (
    <div
      style={{
        padding: "0 24px",
        height: "52px",
        borderBottom: `1px solid ${t.border}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        background: t.sidebar,
        flexShrink: 0,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <span style={{ fontSize: "17px", opacity: 0.8 }}>{current?.icon}</span>
        <span
          style={{
            fontWeight: 800,
            fontSize: "16px",
            letterSpacing: "-0.01em",
          }}
        >
          {current?.label}
        </span>
        <div
          style={{
            height: "18px",
            width: "1px",
            background: t.border,
            marginLeft: "4px",
          }}
        />
        <span
          style={{
            fontSize: "14px",
            color: t.subtext,
            fontFamily: "'DM Mono', monospace",
          }}
        >
          {subtitle}
        </span>
      </div>
      {onToggleTheme && (
        <button
          onClick={onToggleTheme}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 12px",
            borderRadius: 8,
            border: `1px solid ${t.border}`,
            background: t.sidebar,
            color: t.subtext,
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          <span>{isDark ? "☀️" : "🌙"}</span>
          {isDark ? "Light" : "Dark"}
        </button>
      )}
    </div>
  );
}
