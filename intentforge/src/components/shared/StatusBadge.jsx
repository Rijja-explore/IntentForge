import { motion } from 'framer-motion';
import { Check, X, Clock } from 'lucide-react';

export default function StatusBadge({ status }) {
  const config = {
    approved: {
      bg: 'bg-success-emerald/20',
      text: 'text-success-emerald',
      border: 'border-success-emerald/50',
      icon: Check,
      label: 'Approved',
    },
    blocked: {
      bg: 'bg-danger-crimson/20',
      text: 'text-danger-crimson',
      border: 'border-danger-crimson/50',
      icon: X,
      label: 'Blocked',
    },
    pending: {
      bg: 'bg-warning-amber/20',
      text: 'text-warning-amber',
      border: 'border-warning-amber/50',
      icon: Clock,
      label: 'Pending',
    },
  };

  const { bg, text, border, icon: Icon, label } = config[status] || config.pending;

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`
        inline-flex items-center gap-2 px-3 py-1.5
        rounded-full border ${bg} ${text} ${border}
        font-body font-medium text-sm
      `}
    >
      <Icon size={14} />
      <span>{label}</span>
    </motion.div>
  );
}
