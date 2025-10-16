/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./App.tsx",
    "./index.tsx",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#4f46e5',
        'secondary': '#10b981',
        'light-bg': '#f8fafc',
        'dark-bg': '#0f172a',
        'dark-card': '#1e293b',
        'dark-text': '#e2e8f0',
      },
    },
  },
  plugins: [],
}
