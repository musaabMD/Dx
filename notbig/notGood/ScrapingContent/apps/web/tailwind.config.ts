import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: "#f8f6f0",
        ink: "#1f2937",
        accent: "#b45309",
        accentSoft: "#fef3c7"
      },
      fontFamily: {
        sans: ["'Source Sans 3'", "ui-sans-serif", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
