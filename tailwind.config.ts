import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}", "./lib/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        obsidian: "#090604",
        charcoal: "#15100c",
        ember: "#d76f20",
        saffron: "#f3a51f",
        turmeric: "#ffd36a",
        sandalwood: "#c99358",
        rose: "#8b1e3f",
        leaf: "#426b45",
        ivory: "#fff4df"
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "Inter", "system-ui", "sans-serif"]
      },
      boxShadow: {
        glow: "0 24px 100px rgba(243, 165, 31, 0.18)",
        ember: "0 10px 40px rgba(215, 111, 32, 0.22)"
      },
      backgroundImage: {
        mandala: "radial-gradient(circle at center, rgba(255,211,106,0.13) 0 1px, transparent 1px)"
      }
    }
  },
  plugins: []
};

export default config;
