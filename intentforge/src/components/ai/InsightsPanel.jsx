import { motion } from 'framer-motion';
import { containerVariants } from '../../utils/animations';
import SuggestionCard from './SuggestionCard';
import { AI_SUGGESTIONS } from '../../utils/constants';
import { Brain, Sparkles } from 'lucide-react';

export default function InsightsPanel({ onApply }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <motion.div
          animate={{ rotate: [0, 15, -15, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          className="p-2 rounded-xl bg-trust-electric/20"
        >
          <Brain size={20} className="text-trust-electric" />
        </motion.div>
        <div>
          <h3 className="font-display font-semibold text-violet-950">AI Recommendations</h3>
          <p className="font-body text-xs text-slate-400">Based on your spending patterns</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5 text-xs font-body text-money-gold">
          <Sparkles size={14} />
          <span>3 insights</span>
        </div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-3"
      >
        {AI_SUGGESTIONS.map((s) => (
          <SuggestionCard key={s.id} suggestion={s} onAction={onApply} />
        ))}
      </motion.div>
    </div>
  );
}
