import { motion, AnimatePresence } from 'framer-motion';
import { transactionVariants } from '../../utils/animations';
import TransactionCard from './TransactionCard';
import FilterBar from './FilterBar';
import EmptyState from './EmptyState';
import { useEffect, useState } from 'react';
import { MERCHANTS } from '../../utils/constants';
import { Activity, Radio } from 'lucide-react';

export default function LiveFeed({ maxItems = 8 }) {
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState('all');
  const [isLive, setIsLive] = useState(true);

  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      const merchant = MERCHANTS[Math.floor(Math.random() * MERCHANTS.length)];
      const newTx = {
        id: Date.now(),
        merchant: merchant.name,
        amount: Math.floor(Math.random() * 4900) + 100,
        category: merchant.category,
        status: merchant.category === 'gambling'
          ? 'blocked'
          : Math.random() > 0.2 ? 'approved' : 'pending',
        timestamp: new Date(),
      };
      setTransactions(prev => [newTx, ...prev].slice(0, maxItems));
    }, 2500);
    return () => clearInterval(interval);
  }, [isLive, maxItems]);

  const filtered = filter === 'all'
    ? transactions
    : transactions.filter(t => t.status === filter);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Activity size={20} className="text-trust-electric" />
          <h3 className="font-display font-semibold text-lg text-white">Live Feed</h3>
          <motion.div
            animate={{ opacity: isLive ? [1, 0.3, 1] : 0.3 }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="flex items-center gap-1.5"
          >
            <Radio size={14} className={isLive ? 'text-success-emerald' : 'text-white/30'} />
            <span className={`text-xs font-body ${isLive ? 'text-success-emerald' : 'text-white/30'}`}>
              {isLive ? 'LIVE' : 'PAUSED'}
            </span>
          </motion.div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsLive(p => !p)}
          className={`px-3 py-1.5 rounded-lg text-xs font-body border transition-colors ${
            isLive
              ? 'border-success-emerald/50 text-success-emerald bg-success-emerald/10'
              : 'border-white/20 text-white/60 bg-white/5'
          }`}
        >
          {isLive ? 'Pause' : 'Resume'}
        </motion.button>
      </div>

      <FilterBar onFilter={setFilter} />

      <AnimatePresence mode="popLayout">
        {filtered.length === 0 ? (
          <EmptyState />
        ) : (
          filtered.map(tx => (
            <TransactionCard key={tx.id} transaction={tx} />
          ))
        )}
      </AnimatePresence>
    </div>
  );
}
