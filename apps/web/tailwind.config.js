const path = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{ts,tsx,mdx}',
    './src/components/**/*.{ts,tsx,mdx}',
    './src/app/**/*.{ts,tsx,mdx}',
    // Monorepo shared packages (solo fuentes TS/TSX, evitar JS compilados)
    path.join(__dirname, '../../packages/shared/**/*.{ts,tsx,mdx}').replace(/\\/g, '/'),
    path.join(__dirname, '../../packages/shared/components/**/*.{ts,tsx,mdx}').replace(/\\/g, '/'),
    // Exclusiones explícitas para performance
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/dist/**',
  ],
  theme: {
    extend: {
      colors: {
        'spoon-primary': '#FF9933',
        'spoon-secondary': '#FF6B35',
        primary: {
          50: 'var(--sp-primary-50)',
          100: 'var(--sp-primary-100)',
          200: 'var(--sp-primary-200)',
          300: 'var(--sp-primary-300)',
          400: 'var(--sp-primary-400)',
          500: 'var(--sp-primary-500)',
          600: 'var(--sp-primary-600)',
          700: 'var(--sp-primary-700)',
          800: 'var(--sp-primary-800)',
          900: 'var(--sp-primary-900)',
        },
        neutral: {
          0: 'var(--sp-neutral-0)',
          50: 'var(--sp-neutral-50)',
          100: 'var(--sp-neutral-100)',
          200: 'var(--sp-neutral-200)',
          300: 'var(--sp-neutral-300)',
          400: 'var(--sp-neutral-400)',
          500: 'var(--sp-neutral-500)',
          600: 'var(--sp-neutral-600)',
          700: 'var(--sp-neutral-700)',
          800: 'var(--sp-neutral-800)',
          900: 'var(--sp-neutral-900)',
        },
        success: 'var(--sp-success)',
        warning: 'var(--sp-warning)',
        error: 'var(--sp-error)',
        info: 'var(--sp-info)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}