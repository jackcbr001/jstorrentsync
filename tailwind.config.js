/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}','./components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
        display: ['var(--font-syne)', 'system-ui', 'sans-serif'],
      },
      colors: {
        void:   '#080a10',
        space:  '#0e1118',
        panel:  '#131825',
        card:   '#192033',
        rim:    '#1f2a3d',
        muted:  '#2a3750',
        plasma: '#4f6ef7',
        neon:   '#00e5ff',
        pulse:  '#a259ff',
        ember:  '#ff6b35',
        jade:   '#00d68f',
        amber:  '#ffb020',
        rose:   '#ff4d6d',
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'spin-slow': 'spin 4s linear infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-up': 'fadeUp 0.4s ease-out',
      },
      keyframes: {
        glow: {
          '0%,100%': { boxShadow: '0 0 8px rgba(79,110,247,0.4)' },
          '50%': { boxShadow: '0 0 20px rgba(79,110,247,0.8)' },
        },
        slideIn: { from: { transform: 'translateX(-100%)' }, to: { transform: 'translateX(0)' } },
        fadeUp: { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}
