import { useThemedColors } from "./useThemedColors";
import { Label } from "./Label";

interface SectionTitleProps {
  name: string;
  priority: string;
  note?: string;
}

export function SectionTitle({ name, priority, note }: SectionTitleProps) {
  const c = useThemedColors();
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        marginBottom: 18,
        paddingBottom: 14,
        borderBottom: `2px solid ${c.border}`,
        flexWrap: "wrap",
      }}
    >
      <span
        style={{
          fontSize: 13,
          fontWeight: 800,
          color: c.textMuted,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          fontFamily: "Georgia, serif",
        }}
      >
        {name}
      </span>
      <Label
        text={`Priority: ${priority}`}
        color={
          priority === "Critical"
            ? c.error
            : priority === "High"
              ? c.warning
              : c.primary
        }
        bg={
          priority === "Critical"
            ? c.errorLight
            : priority === "High"
              ? c.warningLight
              : c.primaryLight
        }
      />
      {note && (
        <span
          style={{
            fontSize: 11,
            color: c.textMuted,
            fontStyle: "italic",
          }}
        >
          {note}
        </span>
      )}
    </div>
  );
}
