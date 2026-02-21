import { motion, AnimatePresence } from 'framer-motion';
import { cardVariants } from '../../utils/animations';
import { useState } from 'react';
import { Trash2, ChevronDown } from 'lucide-react';
import { RULE_COLORS } from '../../utils/colors';

export default function RuleCard({ rule, onDelete, onToggle }) {
  const [expanded, setExpanded] = useState(false);
  const [active, setActive] = useState(rule.active !== false);
  const colors = RULE_COLORS[rule.color] || RULE_COLORS.blue;

  const handleToggle = () => {
    setActive(p => !p);
    onToggle && onToggle(rule.id, !active);
  };

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ boxShadow: '0 8px 32px rgba(124, 58, 237, 0.12)' }}
      className={`bg-white border rounded-2xl overflow-hidden shadow-glass transition-all ${
        active ? `${colors.border}` : 'border-violet-100 opacity-70'
      }`}
    >
      {/* Color accent top bar */}
      <div className={`h-1 w-full ${active ? `bg-gradient-primary` : 'bg-violet-100'}`} />

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{rule.icon}</span>
            <div>
              <h4 className="font-display font-semibold text-sm text-violet-950">{rule.title}</h4>
              <p className="font-body text-xs text-slate-400 mt-0.5">{rule.description}</p>
            </div>
          </div>

          {/* Toggle switch */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleToggle}
            className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-300 ${
              active ? 'bg-trust-electric' : 'bg-violet-100'
            }`}
            aria-label={active ? 'Disable rule' : 'Enable rule'}
          >
            <motion.div
              animate={{ x: active ? 22 : 2 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
            />
          </motion.button>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-violet-50">
          <div className={`text-xs font-body font-medium px-2.5 py-1 rounded-full ${colors.bg} ${colors.text}`}>
            {rule.rule?.type?.replace(/_/g, ' ') || 'Custom Rule'}
          </div>
          <div className="flex items-center gap-1">
            <motion.button
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={() => setExpanded(p => !p)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-trust-electric hover:bg-violet-50"
              aria-label="Expand rule"
            >
              <motion.div animate={{ rotate: expanded ? 180 : 0 }}>
                <ChevronDown size={16} />
              </motion.div>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={() => onDelete && onDelete(rule.id)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-danger-crimson hover:bg-danger-crimson/10"
              aria-label="Delete rule"
            >
              <Trash2 size={16} />
            </motion.button>
          </div>
        </div>

        {/* Expanded details */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-3 pt-3 border-t border-violet-50">
                <p className="font-body text-xs text-slate-400">
                  Condition: <span className="font-mono text-trust-electric">{rule.rule?.condition}</span>
                </p>
                <p className="font-body text-xs text-slate-400 mt-1">
                  Value: <span className="font-mono text-trust-electric">{String(rule.rule?.value)}</span>
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
