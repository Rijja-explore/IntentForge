import { motion, useSpring, useTransform } from 'framer-motion';
import { useEffect } from 'react';

export default function BalanceCounter({ value }) {
  const spring = useSpring(0, { stiffness: 80, damping: 25 });
  const display = useTransform(spring, (current) =>
    '₹' + Math.round(current).toLocaleString('en-IN')
  );

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return (
    <motion.span className="text-5xl md:text-6xl font-bold font-mono text-white">
      {display}
    </motion.span>
  );
}
