/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#0B132B',
          850: '#0F172A',
          800: '#1C2541',
          700: '#3A506B',
          600: '#475569',
          50: '#F8FAFC'
        },
        brand: {
          blue: '#1E40AF',
          lightBlue: '#3B82F6',
          teal: '#0D9488',
          cyan: '#06B6D4',
          slate: '#64748B'
        }
      }
    },
  },
  plugins: [],
}
