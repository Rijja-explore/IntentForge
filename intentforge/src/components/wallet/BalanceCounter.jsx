import { motion, useSpring, useTransform } from 'framer-motion';
import { useEffect } from 'react';

export default function BalanceCounter({ value }) {
  const spring = useSpring(0, {
    stiffness: 80,
    damping: 20,
  });

  const display = useTransform(spring, (current) =>
    '₹' + Math.round(current).toLocaleString('en-IN')
  );

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
      className="text-5xl md:text-6xl font-bold font-mono text-money-gold leading-none"
    >
      <motion.span>{display}</motion.span>
    </motion.div>
  );
}
