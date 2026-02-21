import { motion } from 'framer-motion';
import { Bell, Search, Shield, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';

function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="font-mono text-xs text-slate-400">
      {time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
    </span>
  );
}

export default function Header({ title = 'Dashboard' }) {
  const [notifCount] = useState(3);
  const [showNotif, setShowNotif] = useState(false);

  const greetings = ['Good Morning', 'Good Afternoon', 'Good Evening'];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? greetings[0] : hour < 17 ? greetings[1] : greetings[2];

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-30 flex items-center justify-between px-6 py-4"
      style={{
        background: 'rgba(4,6,14,0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(167,139,250,0.1)',
        boxShadow: '0 4px 24px rgba(124,58,237,0.2)',
      }}
    >
      {/* Left: Title + Greeting */}
      <div>
        <div className="flex items-center gap-2">
          <h2
            className="font-display font-bold text-2xl"
            style={{ color: '#F1F5F9', letterSpacing: '-0.02em' }}
          >
            {title}
          </h2>
          {title === 'Dashboard' && (
            <motion.div
              animate={{ rotate: [0, 20, -20, 0], scale: [1, 1.2, 1] }}
              transition={{ duration: 3, repeat: Infinity, delay: 1 }}
            >
              <Sparkles size={18} className="text-money-gold" />
            </motion.div>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <p className="text-xs font-body text-slate-500">{greeting}, Prasad</p>
          <span className="text-slate-300">·</span>
          <LiveClock />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <motion.div
          whileFocus={{ scale: 1.02 }}
          className="hidden md:flex items-center gap-2 px-4 py-2.5 rounded-xl cursor-pointer"
          style={{
            background: 'rgba(167,139,250,0.08)',
            border: '1px solid rgba(167,139,250,0.15)',
          }}
        >
          <Search size={15} className="text-slate-400" />
          <span className="text-sm font-body text-slate-400">Search...</span>
          <span className="hidden lg:block text-xs font-mono text-slate-300 bg-slate-100 px-1.5 py-0.5 rounded ml-2">
            ⌘K
          </span>
        </motion.div>

        {/* Trust Score Badge */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl"
          style={{
            background: 'rgba(52,211,153,0.1)',
            border: '1px solid rgba(52,211,153,0.25)',
            boxShadow: '0 0 16px rgba(52,211,153,0.2)',
          }}
        >
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Shield size={15} className="text-success-emerald" />
          </motion.div>
          <span className="text-sm font-mono font-bold text-success-emerald">87</span>
          <span className="text-xs font-body text-success-emerald/70 hidden lg:block">Trust Score</span>
        </motion.div>

        {/* Notifications */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowNotif(!showNotif)}
            className="relative p-2.5 rounded-xl min-h-[44px] min-w-[44px] flex items-center justify-center"
            style={{
              background: 'rgba(167,139,250,0.1)',
              border: '1px solid rgba(167,139,250,0.15)',
            }}
            aria-label="Notifications"
          >
            <Bell size={20} className="text-slate-500" />
            {notifCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{
                  scale: 1,
                  boxShadow: [
                    '0 0 0 0 rgba(220,38,38,0.4)',
                    '0 0 0 6px rgba(220,38,38,0)',
                  ],
                }}
                transition={{
                  scale: { type: 'spring', stiffness: 300 },
                  boxShadow: { duration: 1.5, repeat: Infinity },
                }}
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-danger-crimson text-white text-[10px] font-bold flex items-center justify-center"
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
