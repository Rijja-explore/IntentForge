import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, Settings2, Activity, Brain, Settings } from 'lucide-react';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Home' },
  { path: '/rules', icon: Settings2, label: 'Rules' },
  { path: '/transactions', icon: Activity, label: 'Txns' },
  { path: '/ai', icon: Brain, label: 'AI' },
  { path: '/settings', icon: Settings, label: 'More' },
];

export default function MobileNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50
      bg-white/95 backdrop-blur-xl border-t border-violet-100
      flex items-center justify-around px-2 py-2"
    >
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.path === '/'}
          className={({ isActive }) => `
            flex flex-col items-center gap-1 px-3 py-2 rounded-xl
            transition-all duration-200 min-w-[56px]
            ${isActive ? 'text-trust-electric' : 'text-slate-400'}
          `}
        >
          {({ isActive }) => (
            <>
              <motion.div whileTap={{ scale: 0.85 }}>
                {isActive ? (
                  <motion.div
                    layoutId="mobileActive"
                    className="p-1.5 rounded-lg bg-violet-50"
                  >
                    <item.icon size={20} />
                  </motion.div>
                ) : (
                  <item.icon size={20} />
                )}
              </motion.div>
              <span className="text-[10px] font-body font-medium">{item.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
