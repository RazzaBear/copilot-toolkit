/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#10201f",
        muted: "#5f706e",
        subtle: "#7b8b89",
        canvas: "#f4faf8",
        surface: "#ffffff",
        surfaceMuted: "#edf6f3",
        line: "#c7dbd6",
        lineStrong: "#8fb7ae",
        accent: "#0f766e",
        accentHover: "#115e59",
        accentSoft: "#d8f3ee",
        accentMuted: "#8dd8cb",
        success: "#16834f",
        warning: "#b7791f",
        danger: "#c24132",
        inverse: "#071918",
        inverseMuted: "#b7cbc7",
      },
      fontFamily: {
        sans: ['"Mona Sans"', "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ['"Monaspace Argon"', "ui-monospace", "SFMono-Regular", "monospace"],
      },
    },
  },
  plugins: [],
};
