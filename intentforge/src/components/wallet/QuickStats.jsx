import { motion } from 'framer-motion';
import { containerVariants, cardVariants } from '../../utils/animations';
import { IndianRupee, TrendingUp, TrendingDown, ShieldCheck } from 'lucide-react';

const stats = [
  { label: 'Total Saved', value: '₹12,400', change: '+8%', icon: TrendingUp, color: 'success-emerald', bg: 'bg-success-emerald/10' },
  { label: 'This Week', value: '₹8,900', change: '+12%', icon: IndianRupee, color: 'trust-electric', bg: 'bg-trust-electric/10' },
  { label: 'Blocked', value: '₹3,200', change: '3 txns', icon: TrendingDown, color: 'danger-crimson', bg: 'bg-danger-crimson/10' },
  { label: 'Rules Active', value: '5', change: '2 new', icon: ShieldCheck, color: 'money-gold', bg: 'bg-money-gold/10' },
];

export default function QuickStats() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-2 lg:grid-cols-4 gap-4"
    >
      {stats.map((stat) => (
        <motion.div
          key={stat.label}
          variants={cardVariants}
          whileHover={{ scale: 1.02, boxShadow: '0 8px 32px rgba(124, 58, 237, 0.12)' }}
          className="bg-white border border-violet-100 rounded-2xl p-5 shadow-glass"
        >
          <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
            <stat.icon size={20} className={`text-${stat.color}`} />
          </div>
          <p className={`font-mono font-bold text-xl text-${stat.color}`}>{stat.value}</p>
          <p className="font-body text-xs text-slate-500 mt-1">{stat.label}</p>
          <p className="font-body text-xs text-slate-400 mt-0.5">{stat.change}</p>
        </motion.div>
      ))}
    </motion.div>
  );
}
