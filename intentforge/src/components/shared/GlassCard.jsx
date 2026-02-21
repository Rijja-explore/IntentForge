import { motion } from 'framer-motion';

export default function GlassCard({
  children,
  className = '',
  hover = true,
  glow = false,
  glowColor = 'blue',
  onClick,
}) {
  const glowClasses = {
    blue: 'shadow-glow-blue',
    gold: 'shadow-glow-gold',
    green: 'shadow-glow-green',
    red: 'shadow-glow-red',
  };

  return (
    <motion.div
      whileHover={hover ? {
        scale: 1.02,
        boxShadow: '0 8px 32px rgba(124, 58, 237, 0.12), 0 2px 8px rgba(0,0,0,0.06)'
      } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      onClick={onClick}
      className={`
        bg-white border border-violet-100 rounded-2xl p-6
        shadow-glass ${glow ? glowClasses[glowColor] : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
}
