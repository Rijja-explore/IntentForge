import { motion } from 'framer-motion';
import { cardVariants } from '../../utils/animations';
import { Sparkles, ChevronRight, TrendingDown } from 'lucide-react';
import AnimatedButton from '../shared/AnimatedButton';

export default function SuggestionCard({ suggestion, onAction }) {
  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ scale: 1.02 }}
      className="
        backdrop-blur-md bg-gradient-glass border border-white/10
        rounded-2xl p-5 shadow-glass
      "
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-trust-electric/20 flex items-center justify-center flex-shrink-0">
          <Sparkles size={18} className="text-trust-electric" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-display font-semibold text-white text-sm">{suggestion.title}</h4>
            <span className="text-xs font-mono text-trust-electric bg-trust-electric/10 px-2 py-0.5 rounded-full flex-shrink-0">
              {suggestion.confidence}% sure
            </span>
          </div>
          <p className="font-body text-xs text-white/60 mt-1 leading-relaxed">{suggestion.description}</p>

          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-1.5 text-success-emerald">
              <TrendingDown size={14} />
              <span className="text-xs font-body font-medium">{suggestion.impact}</span>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onAction && onAction(suggestion)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                bg-trust-electric/20 text-trust-electric text-xs font-body font-semibold
                border border-trust-electric/30 hover:bg-trust-electric/30 transition-colors"
            >
              {suggestion.action}
              <ChevronRight size={12} />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
