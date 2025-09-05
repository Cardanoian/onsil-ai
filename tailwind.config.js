import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Noto Sans"', '"Noto Sans KR"', 'system-ui', 'sans-serif'],
      },
      animation: {
        'bounce-slow': 'bounce 1.5s infinite',
      },
    },
  },
  plugins: [typography],
};
