import { motion } from 'framer-motion';

export default function LoadingSpinner({ size = 'md', color = 'blue' }) {
  const sizes = { sm: 'w-6 h-6', md: 'w-10 h-10', lg: 'w-16 h-16' };
  const colors = { blue: 'border-trust-electric', gold: 'border-money-gold', green: 'border-success-emerald' };

  return (
    <div className="flex items-center justify-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className={`${sizes[size]} rounded-full border-4 border-white/10 ${colors[color]} border-t-current`}
      />
    </div>
  );
}
