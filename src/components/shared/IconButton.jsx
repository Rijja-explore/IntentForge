import { motion } from 'framer-motion';

export default function IconButton({ icon: Icon, onClick, variant = 'default', label, size = 20 }) {
  const variants = {
    default: 'text-slate-400 hover:text-slate-100 border border-violet-900/40 hover:border-violet-700/50 hover:bg-violet-900/20',
    primary: 'bg-trust-electric text-white shadow-glow-blue',
    ghost: 'text-slate-400 hover:text-trust-electric hover:bg-violet-900/20',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className={`p-2.5 rounded-xl min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors ${variants[variant]}`}
      aria-label={label}
    >
      <Icon size={size} />
    </motion.button>
  );
}
