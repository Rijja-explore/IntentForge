import { motion } from 'framer-motion';
import { cardVariants } from '../../utils/animations';
import { Toggle } from 'lucide-react';
import { useState } from 'react';
import AnimatedButton from '../shared/AnimatedButton';
import { Trash2, Edit2, Power } from 'lucide-react';

export default function RuleCard({ rule, onDelete, onEdit }) {
  const [active, setActive] = useState(rule.active !== false);

  const colorMap = {
    blue: 'border-trust-electric/30 bg-trust-electric/5',
    red: 'border-danger-crimson/30 bg-danger-crimson/5',
    green: 'border-success-emerald/30 bg-success-emerald/5',
    gold: 'border-money-gold/30 bg-money-gold/5',
    orange: 'border-money-orange/30 bg-money-orange/5',
    purple: 'border-purple-500/30 bg-purple-500/5',
  };

  const textMap = {
    blue: 'text-trust-electric',
    red: 'text-danger-crimson',
    green: 'text-success-emerald',
    gold: 'text-money-gold',
    orange: 'text-money-orange',
    purple: 'text-purple-400',
  };

  const color = rule.color || 'blue';

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ scale: 1.02, boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}
      className={`
        backdrop-blur-md border rounded-2xl p-5 shadow-glass
        ${active ? colorMap[color] : 'border-white/5 bg-white/2 opacity-60'}
        transition-all duration-300
      `}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className={`text-3xl ${active ? '' : 'grayscale opacity-50'}`}>{rule.icon}</div>
          <div className="min-w-0">
            <h3 className={`font-display font-semibold text-base ${active ? 'text-white' : 'text-white/40'}`}>
              {rule.title}
            </h3>
            <p className="font-body text-xs text-white/50 mt-0.5 truncate">{rule.description}</p>
          </div>
        </div>

        {/* Toggle */}
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={() => setActive(p => !p)}
          className={`
            relative w-12 h-6 rounded-full transition-colors duration-300 flex-shrink-0
            ${active ? 'bg-trust-electric' : 'bg-white/10'}
          `}
          aria-label={active ? 'Deactivate rule' : 'Activate rule'}
        >
          <motion.div
            animate={{ x: active ? 24 : 2 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-md"
          />
        </motion.button>
      </div>

      {active && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between"
        >
          <div className={`text-xs font-mono px-2 py-1 rounded-lg ${colorMap[color]} ${textMap[color]} border border-current/20`}>
            {rule.rule?.type?.replace('_', ' ').toUpperCase() || 'CUSTOM RULE'}
          </div>
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onEdit && onEdit(rule)}
              className="p-1.5 rounded-lg text-white/50 hover:text-trust-electric hover:bg-trust-electric/10 transition-colors"
              aria-label="Edit rule"
            >
              <Edit2 size={14} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onDelete && onDelete(rule.id)}
              className="p-1.5 rounded-lg text-white/50 hover:text-danger-crimson hover:bg-danger-crimson/10 transition-colors"
              aria-label="Delete rule"
            >
              <Trash2 size={14} />
            </motion.button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
