"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";
import { useTheme, type ThemeTokens } from "@/hooks/useTheme";

const ACCENT = {
  primary: "#1a56db",
  primaryLight: "#e8f0fe",
  success: "#059669",
  successLight: "#d1fae5",
  error: "#dc2626",
  errorLight: "#fee2e2",
  warning: "#d97706",
  warningLight: "#fef3c7",
};

interface ThemeContextValue {
  isDark: boolean;
  setDark: (dark: boolean) => void;
  toggleTheme: () => void;
  t: ThemeTokens;
  colors: typeof ACCENT & {
    bg: string;
    cardBg: string;
    border: string;
    text: string;
    textMuted: string;
    neutral: string;
    neutralLight: string;
    white: string;
  };
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setDark] = useState(true);
  const toggleTheme = useCallback(() => setDark((d) => !d), []);
  const t = useTheme(isDark);

  const colors = useMemo(
    () => ({
      ...ACCENT,
      bg: t.bg,
      cardBg: t.surface,
      border: t.border,
      text: t.text,
      textMuted: t.muted,
      neutral: t.muted,
      neutralLight: t.surface2,
      white: t.surface,
    }),
    [t]
  );

  const value = useMemo(
    () => ({ isDark, setDark, toggleTheme, t, colors }),
    [isDark, toggleTheme, t, colors]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useThemeContext() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useThemeContext must be used within ThemeProvider");
  return ctx;
}
