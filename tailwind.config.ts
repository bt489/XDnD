import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Deep sanctum atmosphere
        void: "#08080f",
        abyss: "#0d0d1a",
        sanctum: "#121220",
        chamber: "#1a1a2e",
        // Parchment spectrum
        parchment: {
          DEFAULT: "#e8d5a8",
          light: "#f4e4c1",
          dark: "#d4b96a",
          burnt: "#c4a86a",
        },
        // Ink depths
        ink: {
          DEFAULT: "#1a0e08",
          light: "#2c1810",
          mid: "#4a3728",
        },
        // Precious metals
        gold: {
          DEFAULT: "#d4a843",
          pale: "#e8c76a",
          deep: "#a07d2e",
          ember: "#b8922e",
        },
        // Accent bloods
        crimson: {
          DEFAULT: "#7a1616",
          light: "#a52a2a",
          glow: "#c41e1e",
        },
        // Arcane purple
        arcane: {
          DEFAULT: "#4a3475",
          dim: "#2d1f4e",
          glow: "#6b4fa0",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        cinzel: ["var(--font-cinzel)", "serif"],
        body: ["var(--font-body)", "serif"],
      },
      keyframes: {
        "dice-tumble": {
          "0%": { transform: "rotateX(0deg) rotateY(0deg) rotateZ(0deg)" },
          "25%": { transform: "rotateX(90deg) rotateY(45deg) rotateZ(90deg)" },
          "50%": { transform: "rotateX(180deg) rotateY(90deg) rotateZ(180deg)" },
          "75%": { transform: "rotateX(270deg) rotateY(135deg) rotateZ(270deg)" },
          "100%": { transform: "rotateX(360deg) rotateY(180deg) rotateZ(360deg)" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "ember-glow": {
          "0%, 100%": { boxShadow: "0 0 8px rgba(212, 168, 67, 0.3), 0 0 20px rgba(212, 168, 67, 0.1)" },
          "50%": { boxShadow: "0 0 16px rgba(212, 168, 67, 0.5), 0 0 40px rgba(212, 168, 67, 0.2)" },
        },
        "text-glow": {
          "0%, 100%": { textShadow: "0 0 10px rgba(212, 168, 67, 0.4), 0 0 30px rgba(212, 168, 67, 0.1)" },
          "50%": { textShadow: "0 0 20px rgba(212, 168, 67, 0.6), 0 0 50px rgba(212, 168, 67, 0.2)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "reveal": {
          "0%": { opacity: "0", transform: "scale(0.95) translateY(20px)", filter: "blur(4px)" },
          "100%": { opacity: "1", transform: "scale(1) translateY(0)", filter: "blur(0)" },
        },
        "particle-drift": {
          "0%": { transform: "translateY(0) translateX(0)", opacity: "0" },
          "10%": { opacity: "1" },
          "90%": { opacity: "1" },
          "100%": { transform: "translateY(-100vh) translateX(30px)", opacity: "0" },
        },
      },
      animation: {
        "dice-tumble": "dice-tumble 2s cubic-bezier(0.4, 0, 0.2, 1) infinite",
        "fade-in-up": "fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "fade-in": "fade-in 0.6s ease-out forwards",
        "ember-glow": "ember-glow 3s ease-in-out infinite",
        "text-glow": "text-glow 4s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "shimmer": "shimmer 3s ease-in-out infinite",
        "reveal": "reveal 1s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "particle-drift": "particle-drift linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;
