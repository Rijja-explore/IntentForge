import { motion } from 'framer-motion';

export default function IconButton({ icon: Icon, onClick, variant = 'ghost', className = '', title = '', size = 20 }) {
  const variants = {
    ghost: 'text-white/70 hover:text-white bg-white/5 hover:bg-white/10',
    primary: 'text-white bg-trust-electric/20 hover:bg-trust-electric/40',
    danger: 'text-danger-crimson bg-danger-crimson/10 hover:bg-danger-crimson/20',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      title={title}
      className={`
        p-2 rounded-lg transition-colors duration-200
        min-h-[44px] min-w-[44px] flex items-center justify-center
        ${variants[variant]}
        ${className}
      `}
    >
      <Icon size={size} />
    </motion.button>
  );
}
