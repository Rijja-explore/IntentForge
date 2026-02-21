import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export default function AnimatedButton({
  children,
  onClick,
  variant = 'primary',
  loading = false,
  disabled = false,
  icon: Icon,
  className = '',
  type = 'button',
}) {
  const variants = {
    primary: 'bg-gradient-primary text-white shadow-glow-blue',
    money: 'bg-gradient-money text-neutral-charcoal shadow-glow-gold font-bold',
    outline: 'border-2 border-trust-electric text-trust-electric bg-transparent',
    ghost: 'text-trust-electric bg-trust-electric/10 hover:bg-trust-electric/20',
    danger: 'bg-danger-crimson/20 text-danger-crimson border border-danger-crimson/50',
    success: 'bg-success-emerald/20 text-success-emerald border border-success-emerald/50',
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      onClick={onClick}
      disabled={disabled || loading}
      type={type}
      className={`
        px-6 py-3 rounded-lg font-semibold font-body
        flex items-center justify-center gap-2
        transition-all duration-300
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${className}
      `}
    >
      {loading ? (
        <Loader2 className="animate-spin" size={20} />
      ) : Icon ? (
        <Icon size={20} />
      ) : null}
      <span>{children}</span>
    </motion.button>
  );
}
