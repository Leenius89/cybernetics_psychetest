module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',
        'primary-dark': '#2563EB',
        secondary: '#10B981',
        'secondary-dark': '#059669',
        'light': {
          bg: '#F9FAFB',
          text: '#1F2937',
        },
        'dark': {
          bg: '#1F2937',
          text: '#F9FAFB',
        },
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}