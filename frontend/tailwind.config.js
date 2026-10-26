/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1360px",
      },
    },
    extend: {
      colors: {
        border: "#E6E9EF",
        input: "#E6E9EF",
        ring: "#F26336",
        background: "#FFFFFF",
        foreground: "#172033",
        soft: "#F7F8FA",
        surface: "#FFFFFF",
        primary: {
          DEFAULT: "#F26336", // Primary Accent Orange
          hover: "#DF4E27",
          active: "#C83E18",
          foreground: "#ffffff",
          50: "#FFF0E9",
          100: "#FFE3D6",
          200: "#FFC2A8",
          500: "#F26336",
          600: "#DF4E27",
          700: "#C83E18",
          800: "#A33111",
          900: "#7A240C",
        },
        secondary: {
          DEFAULT: "#4263EB", // Secondary Accent Blue
          hover: "#3651C9",
          foreground: "#ffffff",
          50: "#EEF2FF",
          100: "#E0E7FF",
          500: "#4263EB",
          600: "#3651C9",
        },
        accent: {
          DEFAULT: "#F26336",
          soft: "#FFF0E9",
          foreground: "#ffffff",
        },
        text: {
          primary: "#172033",
          secondary: "#647084",
          muted: "#8E98A8",
        },
        muted: {
          DEFAULT: "#F7F8FA",
          foreground: "#647084",
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#172033",
        },
        success: {
          DEFAULT: "#168566",
          50: "#E8F5F1",
          100: "#D1ECE4",
          foreground: "#ffffff",
        },
        warning: {
          DEFAULT: "#D99116",
          50: "#FEF7EB",
          100: "#FCEFD8",
          foreground: "#ffffff",
        },
      },
      borderRadius: {
        "2xl": "1rem",
        xl: "0.75rem",
        lg: "0.5rem",
        md: "0.375rem",
        sm: "0.25rem",
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        display: ["Plus Jakarta Sans", "Inter", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(23, 32, 51, 0.05), 0 1px 2px -1px rgba(23, 32, 51, 0.05)",
        "card-hover": "0 10px 25px -5px rgba(23, 32, 51, 0.08), 0 8px 10px -6px rgba(23, 32, 51, 0.04)",
        dropdown: "0 12px 32px -4px rgba(23, 32, 51, 0.12), 0 4px 12px -2px rgba(23, 32, 51, 0.08)",
      },
    },
  },
  plugins: [],
};

