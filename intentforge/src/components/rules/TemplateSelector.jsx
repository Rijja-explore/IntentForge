import { motion } from 'framer-motion';
import { containerVariants, cardVariants } from '../../utils/animations';
import { RULE_TEMPLATES } from '../../utils/constants';
import { Plus } from 'lucide-react';

export default function TemplateSelector({ onSelect }) {
  return (
    <div>
      <h3 className="font-display font-semibold text-lg text-white mb-4">Quick Templates</h3>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
      >
        {RULE_TEMPLATES.map((template) => (
          <motion.button
            key={template.id}
            variants={cardVariants}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect && onSelect(template)}
            className="
              text-left p-4 rounded-xl
              bg-gradient-glass backdrop-blur-md
              border border-white/10 hover:border-trust-electric/50
              shadow-glass transition-colors duration-200
              group
            "
          >
            <div className="flex items-start justify-between">
              <span className="text-2xl">{template.icon}</span>
              <Plus size={16} className="text-white/30 group-hover:text-trust-electric transition-colors" />
            </div>
            <p className="font-body font-semibold text-sm text-white mt-2">{template.title}</p>
            <p className="font-body text-xs text-white/50 mt-1 leading-relaxed">{template.description}</p>
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}
