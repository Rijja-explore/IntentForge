/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'trust-deep': '#0A2463',
        'trust-electric': '#3E92CC',
        'money-gold': '#FFB81C',
        'money-orange': '#FF6B35',
        'danger-crimson': '#D00000',
        'success-emerald': '#06D6A0',
        'warning-amber': '#FFA500',
        'neutral-slate': '#1E293B',
        'neutral-charcoal': '#0F172A',
        'glass-white': 'rgba(255, 255, 255, 0.05)',
      },
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #0A2463 0%, #3E92CC 100%)',
        'gradient-money': 'linear-gradient(135deg, #FFB81C 0%, #FF6B35 100%)',
        'gradient-glass': 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
        'gradient-mesh': 'radial-gradient(circle at 20% 50%, rgba(62,146,204,0.2) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255,184,28,0.2) 0%, transparent 50%)',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glow-blue': '0 0 20px rgba(62, 146, 204, 0.5)',
        'glow-gold': '0 0 20px rgba(255, 184, 28, 0.5)',
        'glow-red': '0 0 20px rgba(208, 0, 0, 0.5)',
        'glow-green': '0 0 20px rgba(6, 214, 160, 0.5)',
        'card-hover': '0 20px 40px rgba(0, 0, 0, 0.3)',
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
