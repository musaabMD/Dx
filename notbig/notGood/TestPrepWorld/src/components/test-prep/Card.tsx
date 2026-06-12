"use client";

import { useContext } from "react";
import { colors } from "./colors";
import { ThemeContext } from "@/contexts/ThemeContext";

interface CardProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export function Card({ children, style = {} }: CardProps) {
  const theme = useContext(ThemeContext);
  const bg = theme ? theme.t.surface : colors.white;
  const border = theme ? theme.t.border : colors.border;
  const shadow = theme?.isDark ? "0 2px 16px rgba(0,0,0,0.2)" : "0 2px 16px rgba(0,0,0,0.06)";

  return (
    <div
      style={{
        background: bg,
        borderRadius: 16,
        border: `1px solid ${border}`,
        boxShadow: shadow,
        overflow: "hidden",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
