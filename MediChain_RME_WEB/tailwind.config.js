/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: '#0B0B1E',
        surface: '#13132B',
        violet: {
          500: '#7C5CFF',
          400: '#9B82FF',
        },
        azure: {
          500: '#4F7CFF',
          400: '#6E97FF',
        },
        mist: '#A8A8C8',
      },
      fontFamily: {
        heading: ['"Sora"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #7C5CFF 0%, #4F7CFF 100%)',
      },
    },
  },
  plugins: [],
};