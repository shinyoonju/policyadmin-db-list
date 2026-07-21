import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#102A43',
        soft: '#F1F8FE',
        line: '#DCE8F2',
        brand: '#123A63',
        gold: '#F4B942',
        walnut: '#9A6238'
      }
    }
  },
  plugins: []
};

export default config;
