import { motion, animate } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { IndianRupee, TrendingUp, TrendingDown, ShieldCheck } from 'lucide-react';

function AnimatedNumber({ value, prefix = '', suffix = '', className = '' }) {
  const ref = useRef(null);

  useEffect(() => {
    const numericValue = parseFloat(value.toString().replace(/[^0-9.]/g, '')) || 0;
    const controls = animate(0, numericValue, {
      duration: 1.5,
      ease: [0.22, 1, 0.36, 1],
      delay: 0.3,
      onUpdate: (v) => {
        if (ref.current) {
          ref.current.textContent = prefix + (
            numericValue > 100
              ? '₹' + Math.round(v).toLocaleString('en-IN')
              : Math.round(v).toString()
          ) + suffix;
        }
      },
    });
    return controls.stop;
  }, [value, prefix, suffix]);

  return <span ref={ref} className={className}>{prefix}0{suffix}</span>;
}

const stats = [
  {
    label: 'Total Saved',
    value: 12400,
    display: '₹12,400',
    change: '+8% vs last month',
    icon: TrendingUp,
    gradient: 'linear-gradient(135deg, #059669, #34D399)',
    bg: 'rgba(5,150,105,0.08)',
    border: 'rgba(5,150,105,0.2)',
    textColor: '#059669',
  },
  {
    label: 'This Week',
    value: 8900,
    display: '₹8,900',
    change: '+12% growth',
    icon: IndianRupee,
    gradient: 'linear-gradient(135deg, #7C3AED, #A78BFA)',
    bg: 'rgba(124,58,237,0.08)',
    border: 'rgba(124,58,237,0.2)',
    textColor: '#7C3AED',
  },
  {
    label: 'Blocked',
    value: 3200,
    display: '₹3,200',
    change: '3 transactions',
    icon: TrendingDown,
    gradient: 'linear-gradient(135deg, #DC2626, #F87171)',
    bg: 'rgba(220,38,38,0.06)',
    border: 'rgba(220,38,38,0.15)',
    textColor: '#DC2626',
  },
  {
    label: 'Rules Active',
    value: 5,
    display: '5',
    change: '2 new this week',
    icon: ShieldCheck,
    gradient: 'linear-gradient(135deg, #F97316, #FBBF24)',
    bg: 'rgba(249,115,22,0.08)',
    border: 'rgba(249,115,22,0.2)',
    textColor: '#F97316',
  },
];

export default function QuickStats() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: i * 0.08, type: 'spring', stiffness: 160, damping: 20 }}
          whileHover={{
            scale: 1.03,
            y: -4,
            boxShadow: `0 12px 40px ${stat.bg.replace('0.08', '0.25')}, 0 4px 12px rgba(0,0,0,0.06)`,
          }}
          className="relative overflow-hidden bg-white border rounded-2xl p-5 cursor-default"
          style={{
            borderColor: stat.border,
            boxShadow: `0 1px 3px rgba(0,0,0,0.04), 0 4px 16px ${stat.bg}`,
          }}
        >
          {/* Background gradient blob */}
          <div
            className="absolute -top-4 -right-4 w-20 h-20 rounded-full opacity-[0.07] pointer-events-none"
            style={{ background: stat.gradient }}
          />

          {/* Icon */}
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
            style={{ background: stat.gradient, boxShadow: `0 4px 12px ${stat.bg}` }}
          >
            <stat.icon size={20} className="text-white" />
          </div>

          {/* Value */}
          <motion.p
            className="font-mono font-bold text-xl num-highlight"
            style={{ color: stat.textColor }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 + i * 0.08 }}
          >
            <AnimatedNumber value={stat.value} />
          </motion.p>

          {/* Label */}
          <p className="font-body text-sm font-medium text-violet-950 mt-1">{stat.label}</p>
          <p className="font-body text-xs text-slate-400 mt-0.5">{stat.change}</p>

          {/* Bottom shine line */}
          <div
            className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-2xl"
            style={{ background: stat.gradient }}
          />
        </motion.div>
      ))}
    </div>
  );
}
