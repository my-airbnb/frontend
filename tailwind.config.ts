import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF5A5F',
          hover: '#E04848',
        },
        secondary: '#00A699',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 16px rgba(0,0,0,0.12)',
        navbar: '0 1px 0 rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [],
}

export default config
