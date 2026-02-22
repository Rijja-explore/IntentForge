import { motion } from 'framer-motion';
import { transactionVariants } from '../../utils/animations';
import StatusBadge from '../shared/StatusBadge';
import { useState, useEffect } from 'react';
import { formatAmount, formatRelativeTime } from '../../utils/formatters';
import { CATEGORY_COLORS } from '../../utils/colors';

export default function TransactionCard({ transaction }) {
  const [shouldShake, setShouldShake] = useState(false);

  useEffect(() => {
    if (transaction?.status === 'blocked') {
      setShouldShake(true);
      setTimeout(() => setShouldShake(false), 500);
    }
  }, [transaction?.status]);

  if (!transaction) return null;

  return (
    <motion.div
      variants={transactionVariants}
      initial="initial"
      animate={shouldShake ? 'shake' : 'animate'}
      exit="exit"
      className={`
        flex items-center gap-4 p-4 rounded-xl border transition-colors
        ${transaction.status === 'approved'
          ? 'bg-success-emerald/10 border-success-emerald/25'
          : transaction.status === 'blocked'
          ? 'bg-danger-crimson/10 border-danger-crimson/25'
          : 'bg-warning-amber/10 border-warning-amber/25'
        }
      `}
    >
      {/* Category icon */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
        style={{ background: `${CATEGORY_COLORS[transaction.category]}15` }}
      >
        {transaction.avatar || '💳'}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="font-body font-semibold text-sm text-slate-100 truncate">{transaction.merchant}</p>
          <p className={`font-mono font-bold text-sm flex-shrink-0 ${
            transaction.status === 'blocked' ? 'line-through text-slate-400' : 'text-slate-100'
          }`}>
            {formatAmount(transaction.amount)}
          </p>
        </div>
        <div className="flex items-center justify-between mt-1 gap-2">
          <p className="font-body text-xs text-slate-400 capitalize">{transaction.category}</p>
          <StatusBadge status={transaction.status} />
        </div>
        {transaction.timestamp && (
          <p className="font-body text-xs text-slate-500 mt-0.5">
            {formatRelativeTime(transaction.timestamp)}
          </p>
        )}
      </div>
    </motion.div>
  );
}
