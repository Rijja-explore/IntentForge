import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Sparkles } from 'lucide-react';

function PulsingRing({ size, color, delay = 0 }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size,
        height: size,
        top: '50%',
        left: '50%',
        x: '-50%',
        y: '-50%',
        border: `1px solid ${color}`,
      }}
      animate={{
        scale: [1, 1.6, 1.6],
        opacity: [0.6, 0, 0],
      }}
      transition={{ duration: 2.5, repeat: Infinity, delay, ease: 'easeOut' }}
    />
  );
}

export default function TrustScoreGauge({ score = 87, previousScore = 82 }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const change = score - previousScore;
  const [animated, setAnimated] = useState(false);

  useEffect(() => { setTimeout(() => setAnimated(true), 400); }, []);

  const getColor = (s) => {
    if (s >= 90) return '#059669';
    if (s >= 70) return '#7C3AED';
    if (s >= 50) return '#D97706';
    return '#DC2626';
  };

  const getLabel = (s) => {
    if (s >= 90) return 'Excellent';
    if (s >= 70) return 'Good';
    if (s >= 50) return 'Fair';
    return 'Poor';
  };

  const color = getColor(score);
  const offset = circumference - (score / 100) * circumference;

  const ticks = Array.from({ length: 30 }, (_, i) => i);
  const tickAngle = 360 / ticks.length;

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Gauge */}
      <div className="relative w-44 h-44">
        {/* Pulsing rings (only at high score) */}
        {score >= 85 && (
          <>
            <PulsingRing size={120} color={color} delay={0} />
            <PulsingRing size={120} color={color} delay={1.2} />
          </>
        )}

        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          {/* Tick marks around the circle */}
          {ticks.map((tick) => {
            const angle = (tick * tickAngle * Math.PI) / 180;
            const isActive = tick <= (score / 100) * ticks.length;
            const x1 = 60 + 46 * Math.cos(angle);
            const y1 = 60 + 46 * Math.sin(angle);
            const x2 = 60 + 52 * Math.cos(angle);
            const y2 = 60 + 52 * Math.sin(angle);
            return (
              <line
                key={tick}
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke={isActive ? color : 'rgba(124,58,237,0.1)'}
                strokeWidth="1.5"
                strokeLinecap="round"
                opacity={isActive ? 0.7 : 0.3}
              />
            );
          })}

          {/* Background track */}
          <circle
            cx="60" cy="60" r={radius}
            fill="none"
            stroke="rgba(167,139,250,0.1)"
            strokeWidth="10"
          />

          {/* Secondary decorative ring */}
          <circle
            cx="60" cy="60" r="42"
            fill="none"
            stroke="rgba(167,139,250,0.07)"
            strokeWidth="2"
          />

          {/* Main arc with gradient */}
          <defs>
            <linearGradient id="arcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={color} stopOpacity="0.8" />
              <stop offset="100%" stopColor={color} stopOpacity="1" />
            </linearGradient>
          </defs>

          <motion.circle
            cx="60" cy="60" r={radius}
            fill="none"
            stroke={`url(#arcGradient)`}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: animated ? offset : circumference }}
            transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
            style={{ filter: `drop-shadow(0 0 8px ${color}80)` }}
          />

          {/* Score dot at end of arc */}
          <motion.circle
            cx={60 + radius * Math.cos((-90 + (score / 100) * 360 - 0.1) * (Math.PI / 180))}
            cy={60 + radius * Math.sin((-90 + (score / 100) * 360 - 0.1) * (Math.PI / 180))}
            r="5"
            fill={color}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: animated ? 1 : 0, scale: animated ? 1 : 0 }}
            transition={{ delay: 2, type: 'spring', stiffness: 300 }}
            style={{ filter: `drop-shadow(0 0 6px ${color})` }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {score >= 90 && (
            <motion.div
              animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="mb-1"
            >
              <Sparkles size={14} style={{ color }} />
            </motion.div>
          )}
          <motion.span
            initial={{ opacity: 0, scale: 0.5, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 1.5, type: 'spring', stiffness: 200, damping: 12 }}
            className="font-mono font-bold text-4xl"
            style={{ color: '#F1F5F9', letterSpacing: '-0.02em' }}
          >
            {score}
          </motion.span>
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.9 }}
            className="font-body text-xs text-slate-400 mt-0.5 font-medium"
          >
            {getLabel(score)}
          </motion.span>
        </div>
      </div>

      {/* Change indicator */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.2 }}
        className="flex items-center gap-2 px-4 py-2 rounded-xl"
        style={{
          background: change >= 0 ? 'rgba(5,150,105,0.08)' : 'rgba(220,38,38,0.08)',
          border: `1px solid ${change >= 0 ? 'rgba(5,150,105,0.2)' : 'rgba(220,38,38,0.2)'}`,
        }}
      >
        {change >= 0 ? (
          <TrendingUp size={14} className="text-success-emerald" />
        ) : (
          <TrendingDown size={14} className="text-danger-crimson" />
        )}
        <span className={`font-body text-sm font-semibold ${change >= 0 ? 'text-success-emerald' : 'text-danger-crimson'}`}>
          {change >= 0 ? '+' : ''}{change} pts this month
        </span>
      </motion.div>
    </div>
  );
}
