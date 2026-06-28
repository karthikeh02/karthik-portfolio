import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#060608",
          50: "#0a0a0f",
          100: "#0d0d14",
          200: "#11111a",
          300: "#171722",
          400: "#1e1e2b",
        },
        cyan: {
          glow: "#34e6ff",
          DEFAULT: "#22d3ee",
          deep: "#0891b2",
        },
        violet: {
          glow: "#a78bfa",
          DEFAULT: "#8b5cf6",
          deep: "#6d28d9",
        },
        magenta: "#f472b6",
        live: "#34d399",
        fog: {
          DEFAULT: "#9aa0b0",
          dim: "#878ea1",
          bright: "#e8eaf0",
        },
      },
      // Fluid, self-consistent display scale (clamp() so type never steps or blows
      // out at the extremes). Tracking is baked in so it's coupled to size.
      fontSize: {
        "display-hero": ["clamp(2.5rem, 11.5vw, 9rem)", { lineHeight: "0.88", letterSpacing: "-0.04em" }],
        "display-xl": ["clamp(2.6rem, 6.5vw, 5.5rem)", { lineHeight: "0.95", letterSpacing: "-0.03em" }],
        "display-lg": ["clamp(2rem, 4.4vw, 3.5rem)", { lineHeight: "1.04", letterSpacing: "-0.025em" }],
        "display-md": ["clamp(1.5rem, 2.8vw, 2.25rem)", { lineHeight: "1.12", letterSpacing: "-0.02em" }],
        "lead": ["1.0625rem", { lineHeight: "1.55" }],
      },
      fontFamily: {
        display: ['"Clash Display"', "system-ui", "sans-serif"],
        sans: ['"General Sans"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      letterSpacing: {
        tightest: "-0.05em",
        tighter: "-0.03em",
      },
      maxWidth: {
        container: "1320px",
      },
      boxShadow: {
        glow: "0 0 40px -8px rgba(34, 211, 238, 0.45)",
        "glow-strong": "0 0 60px -6px rgba(34, 211, 238, 0.6)",
        "glow-violet": "0 0 40px -8px rgba(139, 92, 246, 0.45)",
        "inner-line": "inset 0 1px 0 0 rgba(255,255,255,0.06)",
        lift: "0 24px 60px -30px rgba(0,0,0,0.85)",
      },
      backgroundImage: {
        "grid-fade":
          "linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)",
        "radial-glow":
          "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(34,211,238,0.12), transparent 70%)",
      },
      keyframes: {
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        "marquee-reverse": {
          from: { transform: "translateX(-50%)" },
          to: { transform: "translateX(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "1", boxShadow: "0 0 0 0 rgba(52,211,153,0.5)" },
          "50%": { opacity: "0.7", boxShadow: "0 0 0 6px rgba(52,211,153,0)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        "gradient-pan": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
      animation: {
        marquee: "marquee 38s linear infinite",
        "marquee-reverse": "marquee-reverse 38s linear infinite",
        float: "float 7s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2.4s ease-in-out infinite",
        "gradient-pan": "gradient-pan 8s ease infinite",
      },
    },
  },
  plugins: [animate],
} satisfies Config;
