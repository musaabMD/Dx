interface AvatarProps {
  initials: string;
  color?: string;
  size?: number;
}

export function Avatar({ initials, color, size = 32 }: AvatarProps) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        flexShrink: 0,
        background: color || "#555",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.35,
        fontWeight: 800,
        color: "white",
        fontFamily: "'Bricolage Grotesque', sans-serif",
        userSelect: "none",
      }}
    >
      {initials}
    </div>
  );
}
