/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#FFFBEB',
          100: '#FFF3C7',
          200: '#FFE89A',
          300: '#FFDB6D',
          400: '#FFD144',
          500: '#FFC700',
          600: '#E6B300',
          700: '#CC9F00',
          800: '#B38C00',
          900: '#997800',
          950: '#665000',
        },
        pipeline: {
          potential: '#e2e8f0', // Slate 200
          placed: '#fcd34d',   // Amber 300
          won: '#4ade80',      // Green 400
          lost: '#f87171',     // Red 400
        }
      },
    },
  },
  plugins: [],
}
