import { motion } from 'framer-motion';
import { Bell, Search, Shield, ArrowLeft, Menu } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="font-mono text-xs text-slate-500">
      {time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
    </span>
  );
}

export default function Header({ title = 'Dashboard', onMenuOpen, sidebarOpen = true }) {
  const [notifCount] = useState(3);
  const [showNotif, setShowNotif] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const canGoBack = location.pathname !== '/';

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-30 flex items-center justify-between px-4 md:px-6 py-3.5"
      style={{
        background: 'rgba(4,6,14,0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(167,139,250,0.1)',
        boxShadow: '0 2px 20px rgba(0,0,0,0.4)',
      }}
    >
      {/* Left: Menu + Back + Title */}
      <div className="flex items-center gap-3">
        {/* Hamburger — shown when sidebar is closed */}
        {!sidebarOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            onClick={onMenuOpen}
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.18)' }}
            aria-label="Open sidebar"
          >
            <Menu size={17} className="text-slate-300" />
          </motion.button>
        )}

        {/* Back button */}
        {canGoBack && (
          <motion.button
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.05, x: -2 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.15)' }}
            aria-label="Go back"
          >
            <ArrowLeft size={17} className="text-slate-300" />
          </motion.button>
        )}

        {/* Title */}
        <div>
          <h2
            className="font-display font-semibold text-xl leading-tight"
            style={{ color: '#F1F5F9', letterSpacing: '-0.025em' }}
          >
            {title}
          </h2>
          <div className="flex items-center gap-1.5 mt-0.5">
            <p className="text-xs font-body text-slate-500">{greeting}, Prasad</p>
            <span className="text-slate-700">·</span>
            <LiveClock />
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2.5">
        {/* Search */}
        <motion.div
          whileFocus={{ scale: 1.02 }}
          className="hidden md:flex items-center gap-2 px-3.5 py-2 rounded-xl cursor-pointer"
          style={{
            background: 'rgba(167,139,250,0.07)',
            border: '1px solid rgba(167,139,250,0.13)',
          }}
        >
          <Search size={14} className="text-slate-500" />
          <span className="text-sm font-body text-slate-500">Search...</span>
          <span className="hidden lg:block text-[10px] font-mono text-slate-600 bg-slate-800/60 px-1.5 py-0.5 rounded ml-1">
            ⌘K
          </span>
        </motion.div>

        {/* Trust Score Badge */}
        <motion.div
          whileHover={{ scale: 1.04 }}
          className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl"
          style={{
            background: 'rgba(52,211,153,0.08)',
            border: '1px solid rgba(52,211,153,0.2)',
          }}
        >
          <Shield size={14} className="text-success-emerald" />
          <span className="text-sm font-mono font-bold text-success-emerald">87</span>
          <span className="text-xs font-body text-success-emerald/60 hidden lg:block">Trust</span>
        </motion.div>

        {/* Notifications */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => setShowNotif(!showNotif)}
            className="relative p-2.5 rounded-xl min-h-[40px] min-w-[40px] flex items-center justify-center"
            style={{
              background: 'rgba(167,139,250,0.08)',
              border: '1px solid rgba(167,139,250,0.13)',
            }}
            aria-label="Notifications"
          >
            <Bell size={18} className="text-slate-400" />
            {notifCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-danger-crimson text-white text-[9px] font-bold flex items-center justify-center w-[18px] h-[18px]"
              >
                {notifCount}
              </motion.span>
            )}
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
}
