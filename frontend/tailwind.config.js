/** @type {import('tailwindcss').Config} */

// "Graphite / Signal" palette. Components are written against Tailwind's
// slate / sky / amber scales, so redefining those scales re-themes the app:
//   slate -> graphite (green-tinted near-black neutrals)
//   sky   -> signal (acid lime, the single accent colour)
//   amber -> ember (warm orange for streaks and XP)
const graphite = {
  50: '#f3f4f3',
  100: '#e6e8e6',
  200: '#cdd1ce',
  300: '#a8aea9',
  400: '#808781',
  500: '#5f6661',
  600: '#454b47',
  700: '#2f3431',
  800: '#1e2220',
  900: '#131614',
  950: '#0a0c0b',
};

const signal = {
  50: '#f9ffe6',
  100: '#f0ffc4',
  200: '#e3fd8f',
  300: '#d5f75a',
  400: '#c8f135',
  500: '#acd617',
  600: '#86a80c',
  700: '#66800e',
  800: '#516512',
  900: '#435514',
  950: '#232f04',
};

const ember = {
  50: '#fff6ed',
  100: '#ffead4',
  200: '#ffd1a8',
  300: '#ffb070',
  400: '#ff9447',
  500: '#fb7a1f',
  600: '#e05f0f',
  700: '#b9470f',
  800: '#933914',
  900: '#773114',
  950: '#401608',
};

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        slate: graphite,
        sky: signal,
        amber: ember,
        brand: signal,
        ink: '#070908',
        surface: {
          base: '#070908',
          card: '#0d100f',
          elevated: '#131614',
          border: '#1e2220',
        },
        // Legacy aliases still used by the Admin page
        cyber: {
          bg: '#070908',
          darkCard: '#0d100f',
          cyan: '#c8f135',
          magenta: '#ff9447',
          purple: '#c8f135',
          yellow: '#ff9447',
          neonGreen: '#34d399',
        },
      },
      fontFamily: {
        sans: ['Geist', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"Geist Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      borderRadius: {
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '1rem',
      },
      boxShadow: {
        subtle: '0 1px 2px 0 rgba(0, 0, 0, 0.4)',
        card: '0 1px 0 0 rgba(255, 255, 255, 0.03) inset, 0 12px 32px -16px rgba(0, 0, 0, 0.8)',
        elevated: '0 24px 64px -24px rgba(0, 0, 0, 0.9)',
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.6)',
        signal: '0 0 0 1px rgba(200, 241, 53, 0.35), 0 8px 28px -10px rgba(200, 241, 53, 0.45)',
      },
      backdropBlur: {
        xs: '2px',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to: { opacity: '1', transform: 'none' },
        },
        scan: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(300%)' },
        },
        blink: {
          '0%, 49%': { opacity: '1' },
          '50%, 100%': { opacity: '0' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out both',
        scan: 'scan 1.4s cubic-bezier(0.65, 0, 0.35, 1) infinite',
        blink: 'blink 1s steps(1) infinite',
      },
    },
  },
  plugins: [],
};
