import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#15803d',
          light: '#22c55e',
          dark: '#14532d',
        },
        accent: {
          DEFAULT: '#b45309',
          light: '#f59e0b',
        }
      }
    },
  },
  plugins: [],
}
export default config
