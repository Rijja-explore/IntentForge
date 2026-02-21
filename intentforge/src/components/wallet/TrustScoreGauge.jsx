import { motion } from 'framer-motion';
import { Shield, TrendingUp, TrendingDown } from 'lucide-react';

export default function TrustScoreGauge({ score = 87, previousScore = 82 }) {
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;
  const change = score - previousScore;

  const getColor = (s) => {
    if (s >= 90) return '#06D6A0';
    if (s >= 70) return '#3E92CC';
    if (s >= 50) return '#FFA500';
    return '#D00000';
  };

  const getLabel = (s) => {
    if (s >= 90) return 'Excellent';
    if (s >= 70) return 'Good';
    if (s >= 50) return 'Fair';
    return 'At Risk';
  };

  const color = getColor(score);

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg width="140" height="140" className="-rotate-90">
          {/* Background circle */}
          <circle
            cx="70" cy="70" r="54"
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="10"
          />
          {/* Progress circle */}
          <motion.circle
            cx="70" cy="70" r="54"
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, delay: 0.5, ease: 'easeOut' }}
            style={{ filter: `drop-shadow(0 0 8px ${color})` }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Shield size={20} style={{ color }} />
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, type: 'spring' }}
            className="font-mono font-bold text-3xl text-white mt-1"
          >
            {score}
          </motion.span>
        </div>
      </div>

      <div className="mt-3 text-center">
        <p className="font-display font-semibold text-lg" style={{ color }}>
          {getLabel(score)}
        </p>
        <div className="flex items-center gap-1 justify-center mt-1">
          {change >= 0 ? (
            <TrendingUp size={14} className="text-success-emerald" />
          ) : (
            <TrendingDown size={14} className="text-danger-crimson" />
          )}
          <span className={`text-xs font-body ${change >= 0 ? 'text-success-emerald' : 'text-danger-crimson'}`}>
            {change >= 0 ? '+' : ''}{change} pts this week
          </span>
        </div>
      </div>
    </div>
  );
}
