import { motion } from 'framer-motion';
import { CATEGORIES } from '../../utils/constants';
import { useState } from 'react';

export default function CategoryPicker({ selected = [], onChange }) {
  const toggle = (id) => {
    if (selected.includes(id)) {
      onChange && onChange(selected.filter(s => s !== id));
    } else {
      onChange && onChange([...selected, id]);
    }
  };

  return (
    <div>
      <label className="block font-body text-sm font-medium text-white/70 mb-3">Categories</label>
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <motion.button
            key={cat.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => toggle(cat.id)}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-body
              transition-all duration-200 border
              ${selected.includes(cat.id)
                ? 'bg-trust-electric/20 border-trust-electric text-trust-electric'
                : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20'
              }
            `}
          >
            <span>{cat.icon}</span>
            <span className="font-medium">{cat.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
