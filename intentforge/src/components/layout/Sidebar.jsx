import { motion } from 'framer-motion';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Settings2, Activity, Brain, Settings, Wallet, Zap, TrendingUp } from 'lucide-react';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard', color: '#7C3AED' },
  { path: '/rules', icon: Settings2, label: 'Rules', color: '#C026D3' },
  { path: '/transactions', icon: Activity, label: 'Transactions', color: '#F97316' },
  { path: '/ai', icon: Brain, label: 'AI Insights', color: '#059669' },
  { path: '/settings', icon: Settings, label: 'Settings', color: '#D97706' },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <motion.aside
      initial={{ x: -80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="hidden md:flex flex-col w-20 lg:w-64 h-screen fixed left-0 top-0 z-40 bg-white"
      style={{
        borderRight: '1px solid rgba(124,58,237,0.08)',
        boxShadow: '4px 0 24px rgba(124,58,237,0.06)',
      }}
    >
      {/* Aurora left-edge accent line */}
      <div
        className="absolute left-0 top-0 bottom-0 w-0.5"
        style={{ background: 'linear-gradient(180deg, #7C3AED 0%, #C026D3 50%, #F97316 100%)' }}
      />

      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-6" style={{ borderBottom: '1px solid rgba(124,58,237,0.08)' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
          className="w-10 h-10 rounded-xl flex items-center justify-center shadow-glow-blue flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, #3B0764 0%, #7C3AED 50%, #F97316 100%)',
            boxShadow: '0 4px 16px rgba(124,58,237,0.35), 0 0 0 1px rgba(124,58,237,0.2)',
          }}
        >
          <Zap size={20} className="text-white" style={{ filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.6))' }} />
        </motion.div>
        <div className="hidden lg:block overflow-hidden">
          <motion.h1
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="font-display font-bold text-lg leading-tight"
            style={{ color: '#1E0A3C' }}
          >
            IntentForge
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-xs font-body font-medium"
            style={{
              background: 'linear-gradient(135deg, #7C3AED, #F97316)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Digital Rupee Platform
          </motion.p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 relative">
        {navItems.map((item, index) => {
          const isActive = item.path === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(item.path);

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
            >
              {() => (
                <motion.div
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.06, type: 'spring', stiffness: 160, damping: 20 }}
                  whileHover={{ x: 3 }}
                  className="relative flex items-center gap-3 px-3 py-3 rounded-xl group cursor-pointer"
                  style={{
                    background: isActive ? `${item.color}12` : 'transparent',
                    border: isActive ? `1px solid ${item.color}25` : '1px solid transparent',
                  }}
                >
                  {/* Animated sliding active pill */}
                  {isActive && (
                    <motion.div
                      layoutId="activeNavPill"
                      className="absolute right-2 w-1.5 h-6 rounded-full hidden lg:block"
                      style={{ background: item.color, boxShadow: `0 0 8px ${item.color}80` }}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}

                  {/* Icon */}
                  <motion.div
                    whileHover={{ scale: 1.15, rotate: [0, -8, 8, 0] }}
                    transition={{ duration: 0.3 }}
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      background: isActive ? `${item.color}20` : 'transparent',
                      color: isActive ? item.color : '#94A3B8',
                    }}
                  >
                    <item.icon size={20} />
                  </motion.div>

                  {/* Label */}
                  <span
                    className="hidden lg:block font-body font-medium text-sm transition-colors duration-200"
                    style={{ color: isActive ? '#1E0A3C' : '#94A3B8' }}
                  >
                    {item.label}
                  </span>
                </motion.div>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom wallet card */}
      <div
        className="px-3 py-4 mx-3 mb-4 rounded-2xl"
        style={{
          background: 'linear-gradient(135deg, rgba(124,58,237,0.08) 0%, rgba(249,115,22,0.06) 100%)',
          border: '1px solid rgba(124,58,237,0.12)',
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #F97316, #EA580C)',
              boxShadow: '0 4px 12px rgba(249,115,22,0.3)',
            }}
          >
            <Wallet size={16} className="text-white" />
          </div>
          <div className="hidden lg:block">
            <p className="text-xs font-body text-slate-400">Wallet Balance</p>
            <p className="text-sm font-mono font-bold" style={{ color: '#F97316' }}>₹50,000</p>
          </div>
          <motion.div
            className="hidden lg:block ml-auto"
            animate={{ x: [0, 3, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <TrendingUp size={14} className="text-success-emerald" />
          </motion.div>
        </div>
      </div>
    </motion.aside>
  );
}
