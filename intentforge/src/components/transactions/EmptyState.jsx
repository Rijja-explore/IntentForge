import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';

export default function EmptyState({ message = 'No transactions yet', subtitle = 'Waiting for transactions...' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4"
      >
        <Activity size={28} className="text-white/30" />
      </motion.div>
      <p className="font-display font-semibold text-lg text-white/60">{message}</p>
      <p className="font-body text-sm text-white/30 mt-2">{subtitle}</p>
    </motion.div>
  );
}
