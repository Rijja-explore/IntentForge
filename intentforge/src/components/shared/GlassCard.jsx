import { motion, useMotionValue, useTransform } from 'framer-motion';
import { useRef } from 'react';

export default function GlassCard({
  children,
  className = '',
  hover = true,
  glow = false,
  glowColor = 'blue',
  gradient = false,
  onClick,
}) {
  const cardRef = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [4, -4]);
  const rotateY = useTransform(x, [-100, 100], [-4, 4]);

  const glowClasses = {
    blue: 'shadow-glow-blue',
    gold: 'shadow-glow-gold',
    green: 'shadow-glow-green',
    red: 'shadow-glow-red',
    pink: 'shadow-glow-pink',
  };

  const handleMouseMove = (e) => {
    if (!hover || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(e.clientX - centerX);
    y.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div style={{ perspective: '800px' }} className="w-full">
      <motion.div
        ref={cardRef}
        style={hover ? { rotateX, rotateY } : {}}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        whileHover={hover ? {
          scale: 1.015,
          boxShadow: '0 16px 48px rgba(124, 58, 237, 0.16), 0 4px 12px rgba(0,0,0,0.07)',
          y: -3,
        } : {}}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        onClick={onClick}
        className={`
          glass-card relative overflow-hidden
          bg-white border border-violet-100 rounded-2xl p-6
          shadow-glass
          ${glow ? glowClasses[glowColor] : ''}
          ${onClick ? 'cursor-pointer' : ''}
          ${className}
        `}
      >
        {/* Inner top highlight */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-200 to-transparent opacity-60 pointer-events-none" />

        {/* Gradient border overlay when gradient=true */}
        {gradient && (
          <div className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, rgba(124,58,237,0.06) 0%, rgba(192,38,211,0.04) 50%, rgba(249,115,22,0.06) 100%)',
            }}
          />
        )}

        <div className="relative z-10">
          {children}
        </div>
      </motion.div>
    </div>
  );
}
