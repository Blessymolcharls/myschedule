/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        pastel: {
          bg: '#F6F5FC',
          sidebar: '#EFECFA',
          card: '#FFFFFF',
          'card-subtle': '#FBFAFF',
          border: '#E5E2F0',
          'border-card': '#EAE7F5',
          text: '#26324A',
          muted: '#718096',
          submuted: '#9AA5B8',
          violet: {
            DEFAULT: '#8B7BE8',
            hover: '#7A68DE',
            light: '#ECE9FB',
            dark: '#5A4AB8',
          },
          periwinkle: {
            DEFAULT: '#8FA8E8',
            light: '#EEF2FC',
            dark: '#3B5B9E',
          },
          mint: {
            DEFAULT: '#78D6B0',
            light: '#E4F7F0',
            dark: '#1E7B58',
          },
          yellow: {
            DEFAULT: '#F4D77A',
            light: '#FEF8E3',
            dark: '#8E6814',
          },
          coral: {
            DEFAULT: '#E99A9A',
            light: '#FDECEC',
            dark: '#9E3B3B',
          },
          peach: {
            DEFAULT: '#F7C5A8',
            light: '#FDF2EB',
            dark: '#9A5228',
          },
        },
        brand: {
          50: '#F6F5FC',
          100: '#ECE9FB',
          200: '#D7D0F7',
          300: '#B8ABF2',
          400: '#9E8FEA',
          500: '#8B7BE8',
          600: '#7A68DE',
          700: '#6450C7',
          800: '#513FA5',
          900: '#26324A',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '18px',
        '3xl': '22px',
      },
      boxShadow: {
        card: '0 4px 20px rgba(80, 70, 130, 0.06)',
        'card-hover': '0 8px 28px rgba(80, 70, 130, 0.10)',
        popover: '0 12px 36px rgba(80, 70, 130, 0.12)',
        glow: '0 0 20px -3px rgba(139, 123, 232, 0.25)',
        'glow-amber': '0 0 20px -3px rgba(244, 215, 122, 0.30)',
        'glow-mint': '0 0 20px -3px rgba(120, 214, 176, 0.30)',
      },
    },
  },
  plugins: [],
};
