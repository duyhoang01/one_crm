/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0268C5',
          hover: '#0257A8',
          light: '#EBF4FD',
        },
        azure: '#00ADEE',
        navy: '#1F2533',
        'text-secondary': '#636363',
        'border-default': '#E5E5E5',
        'border-active': '#0268C5',
        'bg-page': '#F2F6FA',
        'bg-sidebar': '#F1F5F9',
        danger: '#FB2C36',
        amber: '#F59E0B',
        success: '#10B981',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        login: '0 20px 40px rgba(0,0,0,.12)',
        card: '0 4px 12px rgba(0,0,0,.1)',
      },
      borderRadius: {
        '2xl': '20px',
      },
    },
  },
  plugins: [],
}

