import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#1FA033",
          dark: "#148026",
        },
        accent: "#2BC041",
        success: "#30D148",
        warning: "#FFC107",
        danger: "#E74C3C",
        gray: {
          100: "#F5F5F5",
          300: "#D1D5DB",
          800: "#333333",
        },
      },
      fontFamily: {
        heading: ["Inter", "SF Pro Display", "sans-serif"],
        body: ["Inter", "SF Pro Text", "sans-serif"],
      },
      fontSize: {
        xl: "24px",
        lg: "20px",
        md: "16px",
        sm: "14px",
      },
      spacing: {
        xs: "4px",
        sm: "8px",
        md: "16px",
        lg: "24px",
        xl: "32px",
      },
      borderRadius: {
        DEFAULT: "8px",
        lg: "12px",
      },
    },
  },
  plugins: [],
};

export default config;

