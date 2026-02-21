import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function TrustScoreGauge({ score = 87, previousScore = 82 }) {
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;
  const change = score - previousScore;

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
  const [animated, setAnimated] = useState(false);
  useEffect(() => { setTimeout(() => setAnimated(true), 300); }, []);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(124,58,237,0.08)" strokeWidth="10" />
          <motion.circle
            cx="60" cy="60" r="54"
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: animated ? offset : circumference }}
            transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
            style={{ filter: `drop-shadow(0 0 6px ${color}60)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono font-bold text-3xl text-violet-950">{score}</span>
          <span className="font-body text-xs text-slate-400">{getLabel(score)}</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        {change >= 0 ? (
          <TrendingUp size={16} className="text-success-emerald" />
        ) : (
          <TrendingDown size={16} className="text-danger-crimson" />
        )}
        <span className={`font-body text-sm font-medium ${change >= 0 ? 'text-success-emerald' : 'text-danger-crimson'}`}>
          {change >= 0 ? '+' : ''}{change} points this month
        </span>
      </div>
    </div>
  );
}
