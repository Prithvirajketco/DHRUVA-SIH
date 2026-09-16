/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        risk: {
          low: '#22c55e',
          moderate: '#eab308',
          high: '#f97316',
          'very-high': '#ef4444',
        },
        panel: 'rgba(15, 23, 42, 0.85)',
        card: 'rgba(15, 23, 42, 0.60)',
        base: '#050a14',
      }
    },
  },
  plugins: [],
}
