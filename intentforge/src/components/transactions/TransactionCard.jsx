import { motion } from 'framer-motion';
import { transactionVariants } from '../../utils/animations';
import StatusBadge from '../shared/StatusBadge';
import { formatAmount, formatRelativeTime } from '../../utils/formatters';
import { useState, useEffect } from 'react';
import { CATEGORIES } from '../../utils/constants';

export default function TransactionCard({ transaction }) {
  const [shouldShake, setShouldShake] = useState(false);
  const category = CATEGORIES.find(c => c.id === transaction.category);

  useEffect(() => {
    if (transaction.status === 'blocked') {
      setShouldShake(true);
      const timer = setTimeout(() => setShouldShake(false), 600);
      return () => clearTimeout(timer);
    }
  }, [transaction.status]);

  return (
    <motion.div
      variants={transactionVariants}
      initial="initial"
      animate={shouldShake ? 'shake' : 'animate'}
      exit="exit"
      whileHover={{ scale: 1.01 }}
      className={`
        p-4 rounded-xl border backdrop-blur-md flex items-center gap-4
        transition-colors duration-300
        ${transaction.status === 'approved'
          ? 'border-success-emerald/20 bg-success-emerald/5'
          : transaction.status === 'blocked'
          ? 'border-danger-crimson/20 bg-danger-crimson/5'
          : 'border-warning-amber/20 bg-warning-amber/5'
        }
      `}
    >
      {/* Category emoji */}
      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-2xl flex-shrink-0">
        {category?.icon || '💳'}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="font-body font-semibold text-white truncate">{transaction.merchant}</p>
          <p className={`font-mono font-bold text-lg flex-shrink-0 ${
            transaction.status === 'blocked' ? 'text-danger-crimson line-through' : 'text-white'
          }`}>
            {formatAmount(transaction.amount)}
          </p>
        </div>
        <div className="flex items-center justify-between gap-2 mt-1">
          <p className="text-xs text-white/50 font-body">{formatRelativeTime(transaction.timestamp)}</p>
          <StatusBadge status={transaction.status} />
        </div>
      </div>
    </motion.div>
  );
}
