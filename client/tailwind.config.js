/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        bg: {
          primary:   '#1a1a2e',
          secondary: '#16213e',
          tertiary:  '#0f3460',
          card:      'rgba(255,255,255,0.07)',
        },
        accent: {
          DEFAULT: '#93c5fd',          // blue-300 — links, highlights, active states
          hover:   '#60a5fa',          // blue-400 — slightly deeper on hover
          light:   '#bfdbfe',          // blue-200 — very light tint
          subtle:  'rgba(147,197,253,0.12)',
        },
        'glass-border': 'rgba(255,255,255,0.12)',
      },
      backgroundImage: {
        'glass-gradient': 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      },
      animation: {
        'fade-in':    'fadeIn 0.4s ease-out',
        'slide-up':   'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.2s ease-out',
      },
      keyframes: {
        fadeIn:    { '0%': { opacity: 0 },                                          '100%': { opacity: 1 } },
        slideUp:   { '0%': { opacity: 0, transform: 'translateY(16px)' },           '100%': { opacity: 1, transform: 'translateY(0)' } },
        slideDown: { '0%': { opacity: 0, transform: 'translateY(-8px)' },           '100%': { opacity: 1, transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}
