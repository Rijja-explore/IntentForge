import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Zap } from 'lucide-react';

export default function DemoModeToggle({ onToggle }) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
        e.preventDefault();
        setActive(p => !p);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    onToggle && onToggle(active);
  }, [active, onToggle]);

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => setActive(p => !p)}
      className="flex items-center gap-2 px-4 py-2 rounded-xl border transition-all duration-300 text-sm font-body font-semibold"
      style={active ? {
        background: 'rgba(251,146,60,0.15)',
        border: '1px solid rgba(251,146,60,0.5)',
        color: '#FB923C',
        boxShadow: '0 0 16px rgba(251,146,60,0.25)',
      } : {
        background: 'rgba(14,19,42,0.8)',
        border: '1px solid rgba(167,139,250,0.2)',
        color: '#64748B',
      }}
    >
      <Zap size={16} />
      <span>Demo Mode</span>
      <AnimatePresence>
        {active && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="text-xs px-1.5 py-0.5 rounded-full font-bold"
            style={{ background: '#FB923C', color: '#fff' }}
          >
            ON
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
