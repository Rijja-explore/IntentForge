import { motion } from 'framer-motion';

export default function LoadingSpinner({ size = 'md', color = 'primary' }) {
  const sizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' };
  const colors = {
    primary: 'border-trust-electric',
    gold: 'border-money-gold',
    green: 'border-success-emerald',
  };

  return (
    <div className={`${sizes[size]} relative`}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className={`${sizes[size]} rounded-full border-2 border-violet-100 ${colors[color]} border-t-transparent absolute inset-0`}
      />
    </div>
  );
}
