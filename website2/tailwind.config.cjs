/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1f2328",
        canvas: "#f6f8fa",
        line: "#d0d7de",
        accent: "#0969da",
        success: "#1a7f37",
      },
      fontFamily: {
        sans: ['"Mona Sans"', "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ['"Monaspace Argon"', "ui-monospace", "SFMono-Regular", "monospace"],
      },
    },
  },
  plugins: [],
};
