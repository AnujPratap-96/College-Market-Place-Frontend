// tailwind.config.js
module.exports = {
  darkMode: "class", // ✅ this must be set
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
// tailwind.config.ts
theme: {
  extend: {
    colors: {
      orange: {
        400: "#fb923c",
        500: "#f97316",
        600: "#ea580c",
      },
    },
  },
},
  plugins: [],
};
