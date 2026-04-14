/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'royal-blue': {
          DEFAULT: '#002366',
          light: '#1a3a8a',
          dark: '#001a4d',
        },
        'gold': {
          DEFAULT: '#D4AF37',
          light: '#f1d279',
          dark: '#aa8c2c',
        },
        'slate-grey': {
          DEFAULT: '#708090',
          light: '#a1abb5',
          dark: '#4d5d6b',
        }
      },
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
