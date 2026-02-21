import { motion } from 'framer-motion';
import { Bell, Search, Shield } from 'lucide-react';
import { useState } from 'react';

export default function Header({ title = 'Dashboard' }) {
  const [notifCount] = useState(3);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-30 flex items-center justify-between px-6 py-4
        bg-neutral-charcoal/80 backdrop-blur-xl border-b border-white/10"
    >
      <div>
        <h2 className="font-display font-bold text-2xl text-white">{title}</h2>
        <p className="text-xs text-white/50 font-body mt-0.5">NXTGEN Hackathon 2025</p>
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <motion.div
          whileFocus={{ scale: 1.02 }}
          className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl
            bg-white/5 border border-white/10 text-white/60"
        >
          <Search size={16} />
          <span className="text-sm font-body">Search...</span>
        </motion.div>

        {/* Trust Score Badge */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl
            bg-success-emerald/10 border border-success-emerald/30 text-success-emerald"
        >
          <Shield size={16} />
          <span className="text-sm font-mono font-semibold">Trust: 87</span>
        </motion.div>

        {/* Notifications */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="relative p-2 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Notifications"
        >
          <Bell size={20} />
          {notifCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-danger-crimson
                text-white text-[10px] font-bold flex items-center justify-center"
            >
              {notifCount}
            </motion.span>
          )}
        </motion.button>
      </div>
    </motion.header>
  );
}
