import { motion } from 'framer-motion';
import { IndianRupee } from 'lucide-react';
import { useState } from 'react';

export default function AmountInput({ label = 'Amount Limit', value, onChange, placeholder = '5000' }) {
  const [focused, setFocused] = useState(false);

  return (
    <div>
      <label className="block font-body text-sm font-medium text-slate-500 mb-2">{label}</label>
      <motion.div
        animate={focused
          ? { boxShadow: '0 0 0 2px #7C3AED', borderColor: '#7C3AED' }
          : { boxShadow: '0 0 0 1px rgba(124,58,237,0.1)', borderColor: 'rgba(124,58,237,0.1)' }
        }
        className="flex items-center gap-3 px-4 py-3 rounded-xl bg-violet-50 border border-violet-100"
      >
        <IndianRupee size={18} className={focused ? 'text-trust-electric' : 'text-slate-400'} />
        <input
          type="number"
          value={value}
          onChange={(e) => onChange && onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          className="flex-1 bg-transparent font-mono text-violet-950 text-lg outline-none placeholder-slate-300"
        />
      </motion.div>
    </div>
  );
}
