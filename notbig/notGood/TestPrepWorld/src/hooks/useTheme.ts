export interface ThemeTokens {
  bg: string;
  sidebar: string;
  surface: string;
  surface2: string;
  border: string;
  text: string;
  subtext: string;
  muted: string;
  inputBg: string;
}

export function useTheme(dark: boolean): ThemeTokens {
  return {
    bg: dark ? "#111113" : "#f8f8f9",
    sidebar: dark ? "#1c1c20" : "#f0f0f2",
    surface: dark ? "#252529" : "#eaeaea",
    surface2: dark ? "#2e2e33" : "#e0e0e4",
    border: dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
    text: dark ? "#f4f4f6" : "#0f0f12",
    subtext: dark ? "rgba(255,255,255,0.65)" : "rgba(0,0,0,0.55)",
    muted: dark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.4)",
    inputBg: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
  };
}
