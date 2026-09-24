/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        teal: {
          DEFAULT: '#a3d2ca',
          dark: '#7fbfb6',
          light: '#c6eadf',
        },
        peach: {
          DEFAULT: '#f7d9c4',
          dark: '#e8b898',
          light: '#fff8f5',
        },
        lavender: {
          DEFAULT: '#e0eafc',
        },
        brand: {
          50: '#f7d9c4',
          100: '#e0eafc',
          200: '#c6eadf',
          300: '#a3d2ca',
          400: '#7fbfb6',
          500: '#5a9e94',
          600: '#355c7d',
          700: '#6c5b7b',
          800: '#2c435a',
          900: '#1e2e3d',
        },
        pastel: {
          main: '#355c7d',
          accent: '#6c5b7b',
          body: '#444444',
          muted: '#8a9bb5',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        xs: '0 2px 8px rgba(163, 210, 202, 0.10)',
        sm: '0 4px 16px rgba(163, 210, 202, 0.12)',
        md: '0 4px 24px rgba(163, 210, 202, 0.14)',
        lg: '0 8px 32px rgba(163, 210, 202, 0.18)',
        glow: '0 0 25px -5px rgba(163, 210, 202, 0.35)',
        'glow-amber': '0 0 25px -5px rgba(247, 217, 196, 0.40)',
      },
    },
  },
  plugins: [],
};
