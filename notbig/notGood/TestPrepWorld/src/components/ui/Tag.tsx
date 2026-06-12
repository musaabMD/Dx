interface TagProps {
  label: string;
  color?: string;
}

export function Tag({ label, color }: TagProps) {
  return (
    <span
      style={{
        padding: "5px 12px",
        borderRadius: "100px",
        background: color ? `${color}30` : "rgba(255,255,255,0.12)",
        border: `1px solid ${color ? `${color}55` : "rgba(255,255,255,0.18)"}`,
        fontSize: "13px",
        fontWeight: 600,
        color: color || "rgba(255,255,255,0.85)",
        fontFamily: "'DM Mono', monospace",
        letterSpacing: "0.03em",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}
