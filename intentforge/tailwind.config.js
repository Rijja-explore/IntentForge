/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Brand: deep violet + sunrise orange
        'trust-deep': '#3B0764',
        'trust-electric': '#7C3AED',
        'money-gold': '#F97316',
        'money-orange': '#EA580C',
        // Status
        'danger-crimson': '#DC2626',
        'success-emerald': '#059669',
        'warning-amber': '#D97706',
        // Surface: light theme
        'neutral-slate': '#F5F0FF',   // light violet surface
        'neutral-charcoal': '#FAFAFE', // page background
        'glass-white': 'rgba(255,255,255,0.9)',
      },
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        // Firefox-logo sunrise: deep violet → violet → magenta → orange
        'gradient-primary': 'linear-gradient(135deg, #3B0764 0%, #7C3AED 40%, #C026D3 70%, #F97316 100%)',
        'gradient-money': 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
        'gradient-glass': 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(245,240,255,0.9) 100%)',
        'gradient-mesh': 'radial-gradient(circle at 15% 40%, rgba(124,58,237,0.07) 0%, transparent 50%), radial-gradient(circle at 85% 70%, rgba(249,115,22,0.07) 0%, transparent 50%)',
      },
      boxShadow: {
        'glass': '0 1px 3px rgba(0,0,0,0.05), 0 4px 16px rgba(124,58,237,0.08), 0 0 0 1px rgba(124,58,237,0.06)',
        'glow-blue': '0 0 24px rgba(124, 58, 237, 0.25)',
        'glow-gold': '0 0 24px rgba(249, 115, 22, 0.25)',
        'glow-red': '0 0 24px rgba(220, 38, 38, 0.2)',
        'glow-green': '0 0 24px rgba(5, 150, 105, 0.2)',
        'card-hover': '0 8px 32px rgba(124, 58, 237, 0.12), 0 2px 8px rgba(0,0,0,0.06)',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shake': 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shake: {
          '10%, 90%': { transform: 'translate3d(-1px, 0, 0)' },
          '20%, 80%': { transform: 'translate3d(2px, 0, 0)' },
          '30%, 50%, 70%': { transform: 'translate3d(-4px, 0, 0)' },
          '40%, 60%': { transform: 'translate3d(4px, 0, 0)' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
