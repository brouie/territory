import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-geist-mono)", "monospace"],
        body: ["var(--font-geist-sans)", "sans-serif"],
      },
      colors: {
        surface: "#0d1117",
        panel: "#161b22",
        border: "#30363d",
        muted: "#8b949e",
        accent: "#58a6ff",
        danger: "#f85149",
        success: "#3fb950",
      },
    },
  },
  plugins: [],
};
export default config;
