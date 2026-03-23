/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        ocean: {
          DEFAULT: '#0a0f1a',
          light: '#111827',
          lighter: '#1a2332',
          card: '#0f1729',
        },
        lobster: {
          DEFAULT: '#d4432b',
          light: '#e85d47',
          dark: '#b8341f',
        },
        biolum: {
          DEFAULT: '#00d4aa',
          light: '#33e0be',
          dark: '#00a886',
        },
        coral: '#ff7f50',
        ledger: {
          bg: '#f8f4ed',
          surface: '#ffffff',
          hover: '#fdf8f2',
          text: '#1c1410',
          muted: '#6b5c4f',
          faint: '#9e8e7e',
          whisper: '#c4b8aa',
          red: '#c73b20',
          'red-hover': '#a82f18',
          'red-bg': '#fdf0ec',
          coral: '#e8603a',
          teal: '#0a6b5a',
          'teal-bg': '#e8f5f1',
          border: '#e8dfd5',
          'border-strong': '#d4c8ba',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'bio-drift': 'bio-drift 8s ease-in-out infinite',
        'bio-drift-slow': 'bio-drift 12s ease-in-out infinite reverse',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '1' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'bio-drift': {
          '0%, 100%': { opacity: '0.5', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.08)' },
        },
      },
    },
  },
  plugins: [],
};
