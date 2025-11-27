/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#f97316', // Orange-500
        secondary: '#22c55e', // Green-500
        dark: '#1a1a1a',
        light: '#f3f4f6',
      }
    },
  },
  plugins: [],
}
