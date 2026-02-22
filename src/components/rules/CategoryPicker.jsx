import { motion } from 'framer-motion';
import { CATEGORIES } from '../../utils/constants';
import { useState } from 'react';
import { CATEGORY_COLORS } from '../../utils/colors';

export default function CategoryPicker({ selected = [], onChange }) {
  const [localSelected, setLocalSelected] = useState(selected);

  const toggle = (id) => {
    const next = localSelected.includes(id)
      ? localSelected.filter(s => s !== id)
      : [...localSelected, id];
    setLocalSelected(next);
    onChange && onChange(next);
  };

  return (
    <div>
      <label className="block font-body text-sm font-medium text-slate-500 mb-3">
        Select Categories
      </label>
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map(cat => {
          const isSelected = localSelected.includes(cat.id);
          const color = CATEGORY_COLORS[cat.id];
          return (
            <motion.button
              key={cat.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => toggle(cat.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-body font-medium
                border transition-all ${
                  isSelected
                    ? 'text-white border-transparent'
                    : 'bg-violet-50 text-slate-500 border-violet-100 hover:border-trust-electric'
                }`}
              style={isSelected ? { backgroundColor: color, borderColor: color } : {}}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
