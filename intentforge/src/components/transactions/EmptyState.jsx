import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';

export default function EmptyState({ message = 'No transactions yet', subtitle = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="w-16 h-16 rounded-2xl bg-violet-50 flex items-center justify-center mb-4"
      >
        <Activity size={28} className="text-trust-electric/50" />
      </motion.div>
      <p className="font-display font-semibold text-slate-400">{message}</p>
      {subtitle && <p className="font-body text-sm text-slate-300 mt-1">{subtitle}</p>}
    </motion.div>
  );
}
