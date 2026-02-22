import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import TransactionCard from './TransactionCard';
import { MERCHANTS } from '../../utils/constants';
import { Wifi, WifiOff, Activity } from 'lucide-react';

export default function LiveFeed({ maxItems = 10 }) {
  const [transactions, setTransactions] = useState([]);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef();

  useEffect(() => {
    if (paused) { clearInterval(intervalRef.current); return; }
    intervalRef.current = setInterval(() => {
      const merchant = MERCHANTS[Math.floor(Math.random() * MERCHANTS.length)];
      const isGambling = merchant.category === 'gambling';
      const newTx = {
        id: Date.now(),
        merchant: merchant.name,
        avatar: merchant.avatar,
        amount: Math.floor(Math.random() * 4900) + 100,
        category: merchant.category,
        status: isGambling ? 'blocked' : (Math.random() > 0.2 ? 'approved' : 'blocked'),
        timestamp: new Date(),
      };
      setTransactions(prev => [newTx, ...prev].slice(0, maxItems));
    }, 2500);
    return () => clearInterval(intervalRef.current);
  }, [paused, maxItems]);

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-violet-900/30">
            <Activity size={18} className="text-trust-electric" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-lg text-slate-100">Live Feed</h3>
            <div className="flex items-center gap-1.5">
              <motion.div
                animate={{ opacity: paused ? 0.3 : [1, 0.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-2 h-2 rounded-full bg-success-emerald"
              />
              <span className="font-body text-xs text-slate-400">{paused ? 'Paused' : 'Live'}</span>
            </div>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setPaused(p => !p)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-body font-semibold border transition-colors ${
            paused
              ? 'bg-trust-electric text-white border-trust-electric'
              : 'bg-violet-900/20 text-slate-400 border-violet-800/30 hover:border-trust-electric'
          }`}
        >
          {paused ? <Wifi size={14} /> : <WifiOff size={14} />}
          {paused ? 'Resume' : 'Pause'}
        </motion.button>
      </div>

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {transactions.map(tx => (
            <TransactionCard key={tx.id} transaction={tx} />
          ))}
        </AnimatePresence>
        {transactions.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-10 text-slate-300 font-body"
          >
            Waiting for transactions...
          </motion.div>
        )}
      </div>
    </div>
  );
}
