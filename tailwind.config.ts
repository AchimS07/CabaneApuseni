import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ],
      },
      colors: {
        // Ember — warm terracotta/fire accent (CTAs, highlights)
        ember: {
          DEFAULT: '#e34e1c',
          dark: '#c1440e',
          light: '#f96a3a',
          50:  '#fff4f0',
          100: '#ffe0d5',
          200: '#ffc0a8',
          300: '#ff9672',
          400: '#f96a3a',
          500: '#e34e1c',
          600: '#c1440e',
          700: '#9e3509',
          800: '#7d2a08',
          900: '#5e2007',
          950: '#3a1203',
        },
        // Pine — deep mountain pine (navigation, structure, primary actions)
        pine: {
          50:  '#f0f9f3',
          100: '#d4eddd',
          200: '#a8dabb',
          300: '#74c293',
          400: '#44a46e',
          500: '#278551',
          600: '#1e5c3a',
          700: '#184d30',
          800: '#123d26',
          900: '#0c2f1d',
          950: '#071a10',
        },
        // Semantic text tokens
        'text-primary': '#1a1a1a',
        'text-secondary': '#5c6470',
        // Earth — warm amber/terracotta for supporting accents
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
      boxShadow: {
        card: '0 1px 2px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.05)',
        'card-hover': '0 2px 4px rgba(0,0,0,0.10), 0 8px 24px rgba(0,0,0,0.09)',
        nav: '0 1px 0 rgba(0,0,0,0.08)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
};

export default config;
