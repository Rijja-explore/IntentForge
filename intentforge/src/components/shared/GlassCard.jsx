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
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
      } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      onClick={onClick}
      className={`
        backdrop-blur-md bg-gradient-glass
        border border-white/10 rounded-2xl p-6
        shadow-glass ${glow ? glowClasses[glowColor] : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
}
