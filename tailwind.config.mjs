import { type Config } from 'tailwindcss';

const config = {
  content: ['src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f2f6ff',
          100: '#dbe6ff',
          200: '#b4cdff',
          300: '#80acff',
          400: '#4b89ff',
          500: '#1f69ff',
          600: '#084fe6',
          700: '#063eb4',
          800: '#0a2f80',
          900: '#0d2a66'
        }
      }
    }
  },
  plugins: [],
} satisfies Config;

export default config;
