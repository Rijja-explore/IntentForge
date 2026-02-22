import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, Settings2, Activity, Brain, ShieldCheck, Settings } from 'lucide-react';
import { useWeb3 } from '../../hooks/useWeb3';

// ── All possible mobile nav items ────────────────────────────────────
const ALL_NAV = [
  { path: '/',             icon: LayoutDashboard, label: 'Home',   roles: ['lender', 'receiver'] },
  { path: '/rules',        icon: Settings2,       label: 'Rules',  roles: ['lender'] },
  { path: '/transactions', icon: Activity,        label: 'Txns',   roles: ['lender', 'receiver'] },
  { path: '/ai',           icon: Brain,           label: 'AI',     roles: ['lender'] },
  { path: '/intent',       icon: ShieldCheck,     label: 'Funds',  roles: ['lender', 'receiver'] },
  { path: '/settings',     icon: Settings,        label: 'Config', roles: ['receiver'] },
];

export default function MobileNav() {
  const { role } = useWeb3();
  const navItems = ALL_NAV.filter((item) => item.roles.includes(role));

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50
      bg-[#04060E]/95 backdrop-blur-xl border-t border-violet-900/30
      flex items-center justify-around px-2 py-2"
    >
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.path === '/'}
          className={({ isActive }) => `
            flex flex-col items-center gap-1 px-3 py-2 rounded-xl
            transition-all duration-200 min-w-[52px]
            ${isActive ? 'text-trust-electric' : 'text-slate-400'}
          `}
        >
          {({ isActive }) => (
            <>
              <motion.div whileTap={{ scale: 0.85 }}>
                {isActive ? (
                  <motion.div
                    layoutId="mobileActive"
                    className="p-1.5 rounded-lg bg-violet-900/40"
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
