/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './packages/shared/components/**/*.{js,ts,jsx,tsx}',
    './packages/shared/**/*.{js,ts,jsx,tsx}',
    './.storybook/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
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
    },
  },
  plugins: [],
};
