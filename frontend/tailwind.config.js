/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#f0fdf5',
          100: '#dcfce8',
          200: '#bbf7cf',
          300: '#86efa8',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        leaf: {
          50: '#f2fbf4',
          100: '#e1f7e6',
          200: '#c5eed0',
          300: '#97e0ab',
          400: '#62ca80',
          500: '#39ad5b',
          600: '#2a8c46',
          700: '#236f3a',
          800: '#205831',
          900: '#1c492b',
        },
        solar: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        mint: {
          50: '#f4fbf7',
          100: '#e7f7ef',
          200: '#d0efe0',
          300: '#a8dfc6',
          400: '#76c7a6',
          500: '#4fae89',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        display: ['"Outfit"', '"Plus Jakarta Sans"', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(16, 75, 43, 0.08)',
        'glass-hover': '0 12px 40px 0 rgba(16, 75, 43, 0.14)',
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'glow': '0 0 25px -5px rgba(34, 197, 94, 0.25)',
      },
      backgroundImage: {
        'hero-gradient': 'radial-gradient(ellipse at 80% 20%, rgba(187, 247, 208, 0.45), transparent 60%), radial-gradient(ellipse at 20% 80%, rgba(220, 252, 232, 0.6), transparent 70%)',
        'card-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(240, 253, 245, 0.8) 100%)',
      }
    },
  },
  plugins: [],
}
