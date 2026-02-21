import { motion } from 'framer-motion';
import BalanceCounter from './BalanceCounter';
import { IndianRupee, TrendingUp, Lock, Zap } from 'lucide-react';

export default function BalanceHero({ balance = 50000, change = 12.5, locked = 10000 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden bg-gradient-primary rounded-3xl p-8 shadow-2xl"
    >
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-trust-electric/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-money-gold/10 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-white/5 rounded-full blur-2xl" />

      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 text-white/70 mb-3">
              <IndianRupee size={18} />
              <span className="font-body text-sm tracking-wide uppercase">Digital Rupee Balance</span>
            </div>

            <BalanceCounter value={balance} />

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="flex items-center gap-4 mt-4"
            >
              <div className="flex items-center gap-1.5 text-success-emerald">
                <TrendingUp size={16} />
                <span className="font-body text-sm font-medium">+{change}% this month</span>
              </div>
              <div className="flex items-center gap-1.5 text-money-gold/70">
                <Lock size={14} />
                <span className="font-mono text-sm">₹{locked.toLocaleString('en-IN')} locked</span>
              </div>
            </motion.div>
          </div>

          <motion.div
            animate={{
              boxShadow: [
                '0 0 20px rgba(245,158,11,0.3)',
                '0 0 40px rgba(245,158,11,0.5)',
                '0 0 20px rgba(245,158,11,0.3)',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-16 h-16 rounded-2xl bg-gradient-money flex items-center justify-center"
          >
            <Zap size={28} className="text-neutral-charcoal" />
          </motion.div>
        </div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/10"
        >
          {[
            { label: 'Rules Active', value: '5', color: 'text-trust-electric' },
            { label: 'Saved Today', value: '₹2,400', color: 'text-success-emerald' },
            { label: 'Blocked', value: '3 txns', color: 'text-danger-crimson' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 + i * 0.1 }}
              className="text-center"
            >
              <p className={`font-mono font-bold text-lg ${stat.color}`}>{stat.value}</p>
              <p className="font-body text-xs text-white/50 mt-0.5">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}
