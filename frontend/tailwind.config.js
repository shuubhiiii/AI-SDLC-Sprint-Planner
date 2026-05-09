/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#eef4ff',
          100: '#dbe6ff',
          200: '#bcd0ff',
          300: '#8fb0ff',
          400: '#5e87ff',
          500: '#3a63ff',
          600: '#2746ee',
          700: '#1f37c0',
          800: '#1d3198',
          900: '#1c2d79',
        },
        ink: {
          900: '#0b1020',
          800: '#111733',
          700: '#1a2147',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(99,102,241,0.25), 0 10px 40px -10px rgba(58,99,255,0.45)',
      },
    },
  },
  plugins: [],
};
