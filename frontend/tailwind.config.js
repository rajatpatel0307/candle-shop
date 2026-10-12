/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        candle: {
          ivory: '#F7F2EA',
          espresso: '#30231F',
          sage: '#858B70',
          gold: '#B78A54',
        },
      },
    },
  },
  plugins: [],
};
