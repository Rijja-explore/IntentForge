import { motion } from 'framer-motion';
import { containerVariants, cardVariants } from '../../utils/animations';
import { ArrowUpRight, ArrowDownLeft, ShieldCheck, Zap } from 'lucide-react';

const stats = [
  { label: 'Money Saved', value: '₹8,500', change: '+12%', icon: ShieldCheck, color: 'success-emerald', positive: true },
  { label: 'Spending', value: '₹23,400', change: '+5%', icon: ArrowUpRight, color: 'warning-amber', positive: false },
  { label: 'Received', value: '₹35,000', change: '+3%', icon: ArrowDownLeft, color: 'trust-electric', positive: true },
  { label: 'Active Rules', value: '5', change: '2 new', icon: Zap, color: 'money-gold', positive: true },
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
          whileHover={{ scale: 1.03 }}
          className="backdrop-blur-md bg-gradient-glass border border-white/10 rounded-2xl p-4 shadow-glass"
        >
          <div className="flex items-start justify-between mb-3">
            <div className={`p-2 rounded-lg bg-${stat.color}/10`}>
              <stat.icon size={18} className={`text-${stat.color}`} />
            </div>
            <span className={`text-xs font-body font-medium ${stat.positive ? 'text-success-emerald' : 'text-warning-amber'}`}>
              {stat.change}
            </span>
          </div>
          <p className="font-mono font-bold text-xl text-white">{stat.value}</p>
          <p className="font-body text-xs text-white/50 mt-1">{stat.label}</p>
        </motion.div>
      ))}
    </motion.div>
  );
}
