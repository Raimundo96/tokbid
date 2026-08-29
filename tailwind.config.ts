import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        base: {
          black: "#050507",
          panel: "#0F0F14",
          line: "#202028",
        },
        neon: {
          pink: "#FF146E",
          cyan: "#25F4EE",
        },
        gold: "#F4C95D",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      boxShadow: {
        "neon-pink": "0 0 24px rgba(255, 46, 146, 0.35)",
        "neon-cyan": "0 0 24px rgba(51, 245, 232, 0.30)",
        "neon-gold": "0 0 32px rgba(244, 201, 93, 0.35)",
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
        rise: {
          "0%": { transform: "translateY(8px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        bidBump: {
          "0%": { transform: "scale(1)" },
          "35%": { transform: "scale(1.12)" },
          "100%": { transform: "scale(1)" },
        },
      },
      animation: {
        pulseGlow: "pulseGlow 2.4s ease-in-out infinite",
        rise: "rise 0.5s ease-out both",
        bidBump: "bidBump 0.35s ease-out",
      },
    },
  },
  plugins: [],
};
export default config;
