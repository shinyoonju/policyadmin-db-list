import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#111827',
        soft: '#f8fafc',
        line: '#e5e7eb',
        brand: '#2563eb'
      }
    }
  },
  plugins: []
};

export default config;
