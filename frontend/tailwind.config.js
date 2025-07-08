/** @type {import('tailwindcss').Config} */
// tailwind.config.js
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      colors: {
        background: "#0f0f0f",
        foreground: "#ffffff",
        muted: "#666666",
        // Add more if needed
      },
    },
  },
  plugins: [],
};

