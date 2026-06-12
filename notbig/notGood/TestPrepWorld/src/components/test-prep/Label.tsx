import { useThemedColors } from "./useThemedColors";

interface LabelProps {
  text: string;
  color?: string;
  bg?: string;
}

export function Label({ text, color, bg }: LabelProps) {
  const c = useThemedColors();
  const finalColor = color ?? c.primary;
  const finalBg = bg ?? c.primaryLight;
  return (
    <span
      style={{
        display: "inline-block",
        padding: "3px 10px",
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.06em",
        color: finalColor,
        background: finalBg,
        textTransform: "uppercase",
      }}
    >
      {text}
    </span>
  );
}
