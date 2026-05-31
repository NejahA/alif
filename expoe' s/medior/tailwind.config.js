/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}", // all files in app/ directory
    "./components/**/*.{js,jsx,ts,tsx}", // if you later create a components/ folder
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#4F46E5", // indigo-600
          light: "#818CF8",   // indigo-400
          dark: "#3730A3",    // indigo-800
        },
        secondary: "#6B7280", // gray-500
        background: {
          light: "#F9FAFB",   // gray-50
          dark: "#0F172A",    // slate-900
        },
        card: {
          light: "#FFFFFF",
          dark: "#1E293B",    // slate-800
        },
        text: {
          primary: "#1F2937", // gray-800
          secondary: "#6B7280", // gray-500
          light: "#F3F4F6",   // gray-100 (for dark mode)
        },
        success: "#10B981",
        warning: "#F59E0B",
        error: "#EF4444",
        info: "#06B6D4",
      },
    },
  },
  plugins: [],
};
