import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#007AFF",
          hover: "#0066D6",
        },
        ios: {
          blue: "#0A84FF",
          "blue-bright": "#3B9EFF",
          purple: "rgba(88, 86, 214, 0.55)",
          glass: "rgba(20, 28, 48, 0.45)",
          "glass-strong": "rgba(12, 18, 36, 0.62)",
          line: "rgba(255, 255, 255, 0.14)",
          mute: "rgba(255, 255, 255, 0.55)",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-plus-jakarta)",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          '"SF Pro Text"',
          '"SF Pro Display"',
          "sans-serif",
        ],
      },
      boxShadow: {
        "ios-fab": "0 10px 28px rgba(10, 132, 255, 0.45)",
        "ios-dock": "0 12px 40px rgba(0, 0, 0, 0.35)",
        "ios-card": "0 8px 24px rgba(0, 0, 0, 0.22)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "glass-pop": {
          "0%": { opacity: "0", transform: "translateY(10px) scale(0.98)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        "fade-in": "fade-in 0.6s ease-out forwards",
        "glass-pop": "glass-pop 0.45s cubic-bezier(0.22, 1, 0.36, 1) forwards",
      },
      backdropBlur: {
        ios: "28px",
      },
    },
  },
  plugins: [],
};

export default config;
