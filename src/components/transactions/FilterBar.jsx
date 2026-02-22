import { motion } from 'framer-motion';
import { useState } from 'react';

const filters = [
  { value: 'all', label: 'All' },
  { value: 'approved', label: 'Approved' },
  { value: 'blocked', label: 'Blocked' },
  { value: 'pending', label: 'Pending' },
];

export default function FilterBar({ onFilter }) {
  const [active, setActive] = useState('all');

  const handleFilter = (value) => {
    setActive(value);
    onFilter && onFilter(value);
  };

  return (
    <div className="flex gap-2 flex-wrap">
      {filters.map((f) => (
        <motion.button
          key={f.value}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleFilter(f.value)}
          className={`px-4 py-2 rounded-full text-sm font-body font-medium transition-colors ${
            active === f.value
              ? 'bg-trust-electric text-white shadow-glow-blue'
              : 'bg-violet-50 text-slate-500 border border-violet-100 hover:border-trust-electric hover:text-trust-electric'
          }`}
        >
          {f.label}
        </motion.button>
      ))}
    </div>
  );
}
