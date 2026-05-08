/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        teal:           '#2E7D72',
        'teal-dark':    '#1F5C56',
        'teal-light':   '#E8F5F3',
        gold:           '#C9A84C',
        'gold-light':   '#FDF6E3',
        charcoal:       '#4A4A4A',
        cream:          '#FAF8F5',
        'gray-mid':     '#888888',
        'gray-light':   '#F0EEEB',
        'blue-accent':  '#3A7BD5',
        'blue-light':   '#EBF2FC',
        'red-alert':    '#D64045',
        'red-light':    '#FDEEEE',
        'orange-mid':   '#E07B39',
        'orange-light': '#FEF3EC',
        // backward-compat aliases (old tailwind refs still work)
        primary:        '#2E7D72',
        'primary-dark': '#1F5C56',
        'primary-light':'#E8F5F3',
        'admin-dark':   '#2E7D72',
        'admin-mid':    '#1F5C56',
      },
      fontFamily: {
        sans:  ['Inter', 'Segoe UI', 'system-ui', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      boxShadow: {
        card:       '0 2px 12px rgba(46,125,114,0.08)',
        'card-hover':'0 4px 20px rgba(46,125,114,0.15)',
        sidebar:    '2px 0 16px rgba(46,125,114,0.12)',
      },
    },
  },
  plugins: [],
}
