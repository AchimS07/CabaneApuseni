import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary brand — forest green (replaces indigo throughout the app)
        primary: {
          50:  '#f0faf4',
          100: '#d7f0e1',
          200: '#b2e0c6',
          300: '#7dcba4',
          400: '#4aaf7e',
          500: '#2d8f64',
          600: '#207050',
          700: '#1a5c42',
          800: '#164a36',
          900: '#123d2c',
          950: '#0a2219',
        },
        forest: {
          50:  '#f0faf4',
          100: '#d7f0e1',
          200: '#b2e0c6',
          300: '#7dcba4',
          400: '#4aaf7e',
          500: '#2d8f64',
          600: '#207050',
          700: '#1a5c42',
          800: '#164a36',
          900: '#123d2c',
          950: '#0a2219',
        },
        earth: {
          50:  '#fdf8f3',
          100: '#f8ede0',
          200: '#f0d7bc',
          300: '#e4bb8e',
          400: '#d49560',
          500: '#c87a3f',
          600: '#a96235',
          700: '#8b4e2c',
          800: '#714028',
          900: '#5c3523',
          950: '#311a10',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        card: '0 2px 12px 0 rgba(0,0,0,0.08)',
        'card-hover': '0 6px 24px 0 rgba(0,0,0,0.14)',
      },
    },
  },
  plugins: [],
};

export default config;
