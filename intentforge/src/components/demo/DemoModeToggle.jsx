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
      className={`
        flex items-center gap-2 px-4 py-2 rounded-xl
        border transition-all duration-300 text-sm font-body font-semibold
        ${active
          ? 'bg-money-gold/20 border-money-gold text-money-gold shadow-glow-gold'
          : 'bg-violet-50 border-violet-100 text-slate-400'
        }
      `}
    >
      <Zap size={16} />
      <span>Demo Mode</span>
      <AnimatePresence>
        {active && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="text-xs bg-money-gold text-white px-1.5 py-0.5 rounded-full font-bold"
          >
            ON
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
