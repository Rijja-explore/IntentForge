import { motion } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Settings2,
  Activity,
  Brain,
  Settings,
  Wallet,
  Zap
} from 'lucide-react';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/rules', icon: Settings2, label: 'Rules' },
  { path: '/transactions', icon: Activity, label: 'Transactions' },
  { path: '/ai', icon: Brain, label: 'AI Insights' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  return (
    <motion.aside
      initial={{ x: -80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="hidden md:flex flex-col w-20 lg:w-64 h-screen fixed left-0 top-0 z-40
        bg-neutral-charcoal/80 backdrop-blur-xl border-r border-white/10"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-6 border-b border-white/10">
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow-blue flex-shrink-0"
        >
          <Zap size={20} className="text-white" />
        </motion.div>
        <div className="hidden lg:block">
          <h1 className="font-display font-bold text-white text-lg leading-tight">IntentForge</h1>
          <p className="text-xs text-white/50 font-body">Digital Rupee Platform</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-3 rounded-xl
              transition-all duration-200 group
              ${isActive
                ? 'bg-trust-electric/20 text-trust-electric shadow-glow-blue'
                : 'text-white/60 hover:text-white hover:bg-white/5'
              }
            `}
          >
            {({ isActive }) => (
              <>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="flex-shrink-0"
                >
                  <item.icon size={22} />
                </motion.div>
                <span className="hidden lg:block font-body font-medium text-sm">
                  {item.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="hidden lg:block ml-auto w-1.5 h-1.5 rounded-full bg-trust-electric"
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom wallet indicator */}
      <div className="px-3 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-3 py-3">
          <div className="w-8 h-8 rounded-full bg-gradient-money flex items-center justify-center flex-shrink-0">
            <Wallet size={16} className="text-neutral-charcoal" />
          </div>
          <div className="hidden lg:block">
            <p className="text-xs font-body text-white/50">Wallet</p>
            <p className="text-sm font-mono font-semibold text-money-gold">₹50,000</p>
          </div>
        </div>
      </div>
    </motion.aside>
  );
}
