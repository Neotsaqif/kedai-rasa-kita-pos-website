/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fffbeb',
          100: '#fef3c7',
          500: '#f97316', // Warm Orange accent
          600: '#ea580c',
          700: '#c2410c',
          900: '#431407', // Dark Brown accent
        },
        cream: {
          50: '#fdfbf7',
          100: '#f7f4ec',
          200: '#eee8d5',
        }
      }
    },
  },
  plugins: [],
}
