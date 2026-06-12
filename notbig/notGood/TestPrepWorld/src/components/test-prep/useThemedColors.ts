"use client";

import { useContext } from "react";
import { ThemeContext } from "@/contexts/ThemeContext";
import { colors as defaultColors } from "./colors";

export function useThemedColors() {
  const theme = useContext(ThemeContext);
  if (theme?.colors) {
    return theme.colors;
  }
  return {
    ...defaultColors,
    bg: "#f8fafc",
    cardBg: defaultColors.white,
    neutral: defaultColors.neutral,
    neutralLight: defaultColors.neutralLight,
  };
}
