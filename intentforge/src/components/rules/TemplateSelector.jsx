import { motion } from 'framer-motion';
import { containerVariants, cardVariants } from '../../utils/animations';
import { RULE_TEMPLATES } from '../../utils/constants';
import { Plus } from 'lucide-react';
import { RULE_COLORS } from '../../utils/colors';

export default function TemplateSelector({ onSelect }) {
  return (
    <div>
      <p className="font-body text-sm text-slate-500 mb-4">
        Choose a template to start, or build from scratch
      </p>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 gap-3"
      >
        {RULE_TEMPLATES.map(template => {
          const colors = RULE_COLORS[template.color] || RULE_COLORS.blue;
          return (
            <motion.button
              key={template.id}
              variants={cardVariants}
              whileHover={{ scale: 1.02, boxShadow: '0 8px 24px rgba(124,58,237,0.1)' }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(template)}
              className={`flex items-start gap-3 p-4 rounded-xl border ${colors.border} text-left group shadow-glass`}
              style={{ background: 'rgba(14,19,42,0.7)' }}
            >
              <span className="text-2xl flex-shrink-0 mt-0.5">{template.icon}</span>
              <div className="flex-1 min-w-0">
                <p className={`font-body font-semibold text-sm text-slate-100`}>{template.title}</p>
                <p className="font-body text-xs text-slate-400 mt-1">{template.description}</p>
              </div>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileHover={{ opacity: 1, scale: 1 }}
                className={`flex-shrink-0 p-1.5 rounded-lg ${colors.bg} ${colors.text}`}
              >
                <Plus size={14} />
              </motion.div>
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}
