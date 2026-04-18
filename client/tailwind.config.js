/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1DB954',
        'primary-dark': '#17a347',
        'primary-light': '#e8f9ef',
        'admin-dark': '#0F1923',
        'admin-mid': '#1a2d3e',
        'text-dark': '#1A1A1A',
        'text-muted': '#9E9E9E',
        'status-paid': '#1DB954',
        'status-unpaid': '#ef4444',
        'status-partial': '#6366f1',
        'status-late': '#f97316',
        'status-pending': '#f59e0b',
        'status-completed': '#1DB954',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 2px 12px rgba(0,0,0,0.08)',
        'card-hover': '0 4px 20px rgba(0,0,0,0.12)',
      }
    },
  },
  plugins: [],
}
