import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Override slate with warm charcoals - all existing "slate-xxx" classes will use these
        slate: {
          50: '#f8f6f3',
          100: '#e8e3da',
          200: '#d4cdc0',
          300: '#b8ad9a',
          400: '#a09080',
          500: '#8a7a68',
          600: '#6e6052',
          700: '#544840',
          800: '#3a322e',
          900: '#26211e',
          950: '#181512',
        },
        brand: {
          50: '#faf8f5',
          100: '#f2ece3',
          200: '#e6d9c5',
          300: '#d4be9a',
          400: '#c9a96e',
          500: '#bf9b5a', // warm gold - luxurious but not girly
          600: '#a68445',
          700: '#8a6b36',
          800: '#6e552b',
          900: '#584422',
          950: '#3d2e17',
        },
        accent: {
          50: '#faf8f5',
          100: '#f2ece3',
          200: '#e6d9c5',
          300: '#d4be9a',
          400: '#c9a96e',
          500: '#b89352', // warm muted gold - sophisticated accent
          600: '#a07842',
          700: '#846234',
          800: '#694d29',
          900: '#543d21',
          950: '#3a2a16',
        },
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;