/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#FDF3E7",
          100: "#F9E3C8",
          200: "#F2C48E",
          300: "#E8A255",
          400: "#D9852F",
          500: "#5A5A40", // Brand olive primary
          600: "#4A4A34",
          700: "#3A3A28",
          800: "#2B2B1E",
          900: "#2B2B1E", // Dark brand olive
        },
        cream: {
          50: "#FAF8F5", // Base off-white
          100: "#F3EFE6", // Secondary base
          200: "#E2DBD0",
          300: "#D6C9B0",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      borderRadius: {
        xl: "0.75rem", // 12px
        "2xl": "1rem", // 16px
      },
      boxShadow: {
        card: "0 1px 3px rgba(45, 26, 14, 0.06), 0 1px 2px rgba(45, 26, 14, 0.04)",
        "card-hover":
          "0 4px 12px rgba(45, 26, 14, 0.08), 0 2px 4px rgba(45, 26, 14, 0.04)",
      },
    },
  },
  plugins: [],
};
