/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          header: '#1a1a2e',
          'on-dark': '#F5C518',
          accent: '#E53935',
          blue: '#0f3460',
        },
        secondary: {
          light: '#f8f9fa',
          dark: '#16213e',
          muted: '#6c757d',
        },
        status: {
          warning: '#FFCC00',
          success: '#2ECC71',
          error: '#E53935',
          pending: '#f59e0b',
        },
        surface: {
          light: '#ffffff',
          card: '#f8f9fa',
          dark: '#1a1a2e',
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
