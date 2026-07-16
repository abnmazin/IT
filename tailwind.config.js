/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        sidebar: {
          bg: "#0f172a",
          hover: "#1e293b",
          active: "#334155",
          text: "#94a3b8",
          accent: "#38bdf8",
        },
        surface: {
          0: "#f8fafc",
          1: "#ffffff",
          2: "#f1f5f9",
          3: "#e2e8f0",
        },
      },
    },
  },
  plugins: [],
};
