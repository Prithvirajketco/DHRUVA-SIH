/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      colors: {
        risk: {
          low: '#10B981', // Emerald 500
          moderate: '#F59E0B', // Amber 500
          high: '#F97316', // Orange 500
          'very-high': '#E11D48', // Rose 600
        },
        panel: '#FFFFFF',
        card: '#FFFFFF',
        base: '#F4F5F7',
      },
      boxShadow: {
        'soft': '0 4px 20px rgba(0,0,0,0.03)',
        'soft-lg': '0 10px 40px rgba(0,0,0,0.05)',
      }
    },
  },
  plugins: [],
}
