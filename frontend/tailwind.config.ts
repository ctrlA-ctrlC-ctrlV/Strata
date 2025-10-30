import type { Config } from 'tailwindcss';

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.vue"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config;