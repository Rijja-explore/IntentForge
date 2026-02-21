import { motion } from 'framer-motion';
import { useState } from 'react';

const filters = [
  { id: 'all', label: 'All' },
  { id: 'approved', label: 'Approved' },
  { id: 'blocked', label: 'Blocked' },
  { id: 'pending', label: 'Pending' },
];

export default function FilterBar({ onFilter }) {
  const [active, setActive] = useState('all');

  const handleFilter = (id) => {
    setActive(id);
    onFilter && onFilter(id);
  };

  return (
    <div className="flex gap-2 flex-wrap">
      {filters.map((f) => (
        <motion.button
          key={f.id}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleFilter(f.id)}
          className={`
            px-4 py-2 rounded-full text-sm font-body font-medium
            transition-all duration-200 border
            ${active === f.id
              ? 'bg-trust-electric text-white border-trust-electric shadow-glow-blue'
              : 'bg-white/5 text-white/60 border-white/10 hover:border-white/20'
            }
          `}
        >
          {f.label}
        </motion.button>
      ))}
    </div>
  );
}
