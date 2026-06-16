import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        "surface-muted": "var(--surface-muted)",
        border: "var(--border)",
        "border-strong": "var(--border-strong)",
        text: "var(--text)",
        "text-soft": "var(--text-soft)",
        "text-faint": "var(--text-faint)",
        lime: "var(--lime)",
        "lime-strong": "var(--lime-strong)",
        "lime-soft": "var(--lime-soft)",
        ink: "var(--ink)",
        navy: "var(--navy)",
        "navy-strong": "var(--navy-strong)",
        accent: "var(--accent)",
        success: "var(--success)",
        warning: "var(--warning)",
        danger: "var(--danger)",
        "icon-blue": "var(--icon-blue)",
        "icon-blue-bg": "var(--icon-blue-bg)",
        "icon-purple": "var(--icon-purple)",
        "icon-purple-bg": "var(--icon-purple-bg)",
        "icon-orange": "var(--icon-orange)",
        "icon-orange-bg": "var(--icon-orange-bg)",
        "icon-red": "var(--icon-red)",
        "icon-red-bg": "var(--icon-red-bg)",
        "icon-green": "var(--icon-green)",
        "icon-green-bg": "var(--icon-green-bg)"
      },
      fontFamily: {
        serif: ["Georgia", "Cambria", "Times New Roman", "serif"],
        sans: ["Inter", "Segoe UI", "Helvetica Neue", "Arial", "sans-serif"]
      },
      boxShadow: {
        panel: "0 14px 40px rgba(16, 26, 42, 0.08)",
        chrome: "0 1px 0 rgba(255, 255, 255, 0.03), 0 18px 40px rgba(0, 0, 0, 0.22)"
      }
    }
  },
  plugins: []
};

export default config;
