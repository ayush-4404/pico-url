/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      colors: {
        dark: {
          bg: '#0a0a0a',
          surface: '#111111',
          card: 'rgba(255, 255, 255, 0.03)',
          border: 'rgba(255, 255, 255, 0.08)',
        },
        accent: {
          DEFAULT: '#3b82f6',
          hover: '#2563eb',
          light: '#60a5fa',
          subtle: 'rgba(59, 130, 246, 0.12)',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.2s ease-out',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        slideUp: { '0%': { opacity: 0, transform: 'translateY(12px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        slideDown: { '0%': { opacity: 0, transform: 'translateY(-8px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}
