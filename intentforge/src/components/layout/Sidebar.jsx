import { motion, AnimatePresence } from 'framer-motion';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Settings2, Activity, Brain,
  Settings, Zap, TrendingUp, X, Link2, ShieldCheck, Wallet,
} from 'lucide-react';
import { useWeb3 } from '../../hooks/useWeb3';

// ── All possible nav items ───────────────────────────────────────────
const ALL_NAV = [
  { path: '/',             icon: LayoutDashboard, label: 'Dashboard',    color: '#7C3AED', roles: ['lender', 'receiver'] },
  { path: '/rules',        icon: Settings2,       label: 'Rule Builder', color: '#C026D3', roles: ['lender'] },
  { path: '/transactions', icon: Activity,        label: 'Transactions', color: '#F97316', roles: ['lender', 'receiver'] },
  { path: '/ai',           icon: Brain,           label: 'AI Insights',  color: '#059669', roles: ['lender'] },
  { path: '/blockchain',   icon: Link2,           label: 'Audit Log',    color: '#60A5FA', roles: ['lender'] },
  { path: '/intent',       icon: ShieldCheck,     label: 'Fund Rules',   color: '#F59E0B', roles: ['lender', 'receiver'] },
  { path: '/settings',     icon: Settings,        label: 'Settings',     color: '#D97706', roles: ['lender', 'receiver'] },
];

const ROLE_CFG = {
  lender:   { label: 'LENDER',   color: '#A78BFA', bg: 'rgba(167,139,250,0.12)', border: 'rgba(167,139,250,0.25)' },
  receiver: { label: 'RECEIVER', color: '#34D399', bg: 'rgba(52,211,153,0.12)',  border: 'rgba(52,211,153,0.25)'  },
};

function shortenAddr(addr) {
  return addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : '—';
}

export default function Sidebar({ open = true, onClose }) {
  const location = useLocation();
  const { account, role, ethBalance } = useWeb3();

  const navItems = ALL_NAV.filter((item) => item.roles.includes(role));
  const roleCfg  = ROLE_CFG[role] ?? ROLE_CFG.lender;

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          key="sidebar"
          initial={{ x: -280, opacity: 0 }}
          animate={{ x: 0,    opacity: 1 }}
          exit={{ x: -280,    opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="hidden md:flex flex-col w-20 lg:w-64 h-screen fixed left-0 top-0 z-40"
          style={{
            background: 'linear-gradient(180deg, #06091A 0%, #0A0F28 100%)',
            borderRight: '1px solid rgba(167,139,250,0.12)',
            boxShadow: '4px 0 24px rgba(124,58,237,0.15)',
          }}
        >
          {/* Aurora left-edge accent line */}
          <div
            className="absolute left-0 top-0 bottom-0 w-0.5"
            style={{ background: 'linear-gradient(180deg, #7C3AED 0%, #C026D3 50%, #F97316 100%)' }}
          />

          {/* Logo + role badge + close */}
          <div
            className="flex items-center gap-3 px-4 py-5"
            style={{ borderBottom: '1px solid rgba(167,139,250,0.1)' }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, #3B0764 0%, #7C3AED 50%, #F97316 100%)',
                boxShadow: '0 4px 16px rgba(124,58,237,0.35), 0 0 0 1px rgba(124,58,237,0.2)',
              }}
            >
              <Zap size={20} className="text-white" style={{ filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.6))' }} />
            </div>

            <div className="hidden lg:flex flex-1 flex-col overflow-hidden">
              <div className="flex items-center justify-between">
                <div>
                  <h1
                    className="font-display font-bold text-base leading-tight"
                    style={{ color: '#F1F5F9', letterSpacing: '-0.02em' }}
                  >
                    IntentForge
                  </h1>
                  <p
                    className="text-[11px] font-body font-medium mt-0.5"
                    style={{
                      background: 'linear-gradient(135deg, #A78BFA, #FB923C)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    Digital Rupee Platform
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, backgroundColor: 'rgba(167,139,250,0.15)' }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ml-2"
                  style={{ background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.15)' }}
                  aria-label="Close sidebar"
                >
                  <X size={14} className="text-slate-400" />
                </motion.button>
              </div>

              {/* Role badge */}
              {account && (
                <div
                  className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold self-start"
                  style={{ background: roleCfg.bg, border: `1px solid ${roleCfg.border}`, color: roleCfg.color }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: roleCfg.color }}
                  />
                  {roleCfg.label}
                </div>
              )}
            </div>

            {/* Compact close (icon-only sidebar) */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="lg:hidden absolute top-3 right-2 w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(167,139,250,0.08)' }}
              aria-label="Close sidebar"
            >
              <X size={12} className="text-slate-500" />
            </motion.button>
          </div>

          {/* Navigation — role-filtered */}
          <nav className="flex-1 px-3 py-4 space-y-1 relative overflow-y-auto">
            {navItems.map((item, index) => {
              const isActive = item.path === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.path);
              return (
                <NavLink key={item.path} to={item.path} end={item.path === '/'}>
                  {() => (
                    <motion.div
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 + index * 0.05, type: 'spring', stiffness: 160, damping: 20 }}
                      whileHover={{ x: 3 }}
                      className="relative flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer"
                      style={{
                        background: isActive ? `${item.color}12` : 'transparent',
                        border: isActive ? `1px solid ${item.color}25` : '1px solid transparent',
                      }}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeNavPill"
                          className="absolute right-2 w-1.5 h-6 rounded-full hidden lg:block"
                          style={{ background: item.color, boxShadow: `0 0 8px ${item.color}80` }}
                          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        />
                      )}
                      <motion.div
                        whileHover={{ scale: 1.12 }}
                        transition={{ duration: 0.2 }}
                        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{
                          background: isActive ? `${item.color}20` : 'transparent',
                          color: isActive ? item.color : '#64748B',
                        }}
                      >
                        <item.icon size={18} />
                      </motion.div>
                      <span
                        className="hidden lg:block font-body font-medium text-sm"
                        style={{ color: isActive ? '#F1F5F9' : '#64748B' }}
                      >
                        {item.label}
                      </span>
                    </motion.div>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Bottom wallet card — live data */}
          <div
            className="px-3 py-4 mx-3 mb-4 rounded-2xl"
            style={{
              background: `linear-gradient(135deg, ${roleCfg.bg} 0%, rgba(249,115,22,0.08) 100%)`,
              border: `1px solid ${roleCfg.border}`,
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
              <div className="hidden lg:block flex-1 min-w-0">
                <p className="text-[10px] font-mono text-slate-500 truncate">
                  {account ? shortenAddr(account) : 'Not connected'}
                </p>
                <p className="text-sm font-mono font-bold mt-0.5" style={{ color: roleCfg.color }}>
                  {ethBalance} ETH
                </p>
              </div>
              <motion.div
                className="hidden lg:block ml-auto"
                animate={{ x: [0, 3, 0] }}
                transition={{ duration: 2.5, repeat: Infinity }}
              >
                <TrendingUp size={14} className="text-success-emerald" />
              </motion.div>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
