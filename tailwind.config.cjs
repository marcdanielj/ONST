/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0c',
        surface: '#16161a',
        accent_active: '#06b6d4',
        accent_danger: '#ef4444'
      },
      fontFamily: {
        primary: ['Inter', 'sans-serif'],
        data: ['JetBrains Mono', 'monospace']
      }
    },
  },
  plugins: [],
}
