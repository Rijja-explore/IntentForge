import { motion } from 'framer-motion';
import BalanceCounter from './BalanceCounter';
import { IndianRupee, TrendingUp, Lock, Zap, Shield, ArrowUpRight, Inbox, ArrowDownCircle, Clock } from 'lucide-react';

function FloatingOrb({ delay = 0, size = 80, color, x, y }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{ width: size, height: size, left: x, top: y, background: color }}
      animate={{
        y: [0, -20, 0],
        x: [0, 10, 0],
        scale: [1, 1.1, 1],
        opacity: [0.15, 0.25, 0.15],
      }}
      transition={{ duration: 5 + delay, repeat: Infinity, ease: 'easeInOut', delay }}
    />
  );
}

const ROLE_CFG = {
  lender: {
    label: 'Lender Vault · IntentForge',
    gradient: 'linear-gradient(135deg, #2D0060 0%, #5B21B6 30%, #7C3AED 50%, #C026D3 75%, #F97316 100%)',
    shadow: '0 24px 80px rgba(124,58,237,0.4), 0 8px 32px rgba(249,115,22,0.2), 0 0 0 1px rgba(255,255,255,0.1)',
    conicGradient: 'conic-gradient(from 0deg, transparent 0%, rgba(249,115,22,0.3) 25%, transparent 50%, rgba(124,58,237,0.3) 75%, transparent 100%)',
    orbs: [
      { delay: 0,   size: 200, color: 'radial-gradient(circle, rgba(249,115,22,0.3), transparent)',   x: '60%', y: '-30%' },
      { delay: 1.5, size: 160, color: 'radial-gradient(circle, rgba(192,38,211,0.25), transparent)',  x: '-5%', y: '40%'  },
      { delay: 3,   size: 120, color: 'radial-gradient(circle, rgba(124,58,237,0.2), transparent)',   x: '80%', y: '50%'  },
    ],
    logoGradient: 'linear-gradient(135deg, #F97316, #EA580C, #FBBF24)',
    logoShadowBase: 'rgba(249,115,22',
    LogoIcon: Zap,
    chipIcon: IndianRupee,
    lockedLabel: 'locked',
    lockedIcon: Lock,
    stats: [
      { label: 'Rules Active',  value: '5',      icon: Shield,    color: '#A78BFA' },
      { label: 'Saved Today',   value: '₹2,400', icon: TrendingUp, color: '#34D399' },
      { label: 'Blocked',       value: '3 txns', icon: Zap,        color: '#F87171' },
    ],
  },
  receiver: {
    label: 'Receiver Wallet · IntentForge',
    gradient: 'linear-gradient(135deg, #022c22 0%, #065f46 25%, #059669 55%, #0d9488 80%, #0891b2 100%)',
    shadow: '0 24px 80px rgba(5,150,105,0.4), 0 8px 32px rgba(8,145,178,0.2), 0 0 0 1px rgba(255,255,255,0.1)',
    conicGradient: 'conic-gradient(from 0deg, transparent 0%, rgba(8,145,178,0.3) 25%, transparent 50%, rgba(5,150,105,0.3) 75%, transparent 100%)',
    orbs: [
      { delay: 0,   size: 200, color: 'radial-gradient(circle, rgba(8,145,178,0.3), transparent)',   x: '60%', y: '-30%' },
      { delay: 1.5, size: 160, color: 'radial-gradient(circle, rgba(16,185,129,0.25), transparent)', x: '-5%', y: '40%'  },
      { delay: 3,   size: 120, color: 'radial-gradient(circle, rgba(13,148,136,0.2), transparent)',  x: '80%', y: '50%'  },
    ],
    logoGradient: 'linear-gradient(135deg, #059669, #0d9488, #0891b2)',
    logoShadowBase: 'rgba(5,150,105',
    LogoIcon: Inbox,
    chipIcon: IndianRupee,
    lockedLabel: 'claimable',
    lockedIcon: ArrowDownCircle,
    stats: [
      { label: 'Rules Received', value: '5',      icon: Inbox,      color: '#34D399' },
      { label: 'Claimable',      value: '₹2,500', icon: ArrowDownCircle, color: '#0ea5e9' },
      { label: 'Expiring Soon',  value: '1 rule', icon: Clock,      color: '#FCD34D' },
    ],
  },
};

export default function BalanceHero({ balance = 50000, change = 12.5, locked = 10000, role = 'lender' }) {
  const cfg = ROLE_CFG[role] || ROLE_CFG.lender;
  const { LogoIcon, lockedIcon: LockedIcon } = cfg;

  return (
    <motion.div
      initial={{ opacity: 0, y: -24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-3xl"
      style={{ background: cfg.gradient, boxShadow: cfg.shadow }}
    >
      {/* Spinning conic gradient ring overlay */}
      <motion.div
        className="absolute -inset-1 rounded-3xl pointer-events-none"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        style={{ background: cfg.conicGradient, filter: 'blur(12px)', opacity: 0.5 }}
      />

      {/* Aurora blobs */}
      {cfg.orbs.map((orb, i) => (
        <FloatingOrb key={i} delay={orb.delay} size={orb.size} color={orb.color} x={orb.x} y={orb.y} />
      ))}

      {/* Top highlight line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

      <div className="relative z-10 p-8">
        {/* Header row */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-2 mb-3"
            >
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                <IndianRupee size={12} className="text-white" />
              </div>
              <span className="font-body text-xs text-white/70 tracking-widest uppercase font-medium">
                {cfg.label}
              </span>
            </motion.div>
            <BalanceCounter value={balance} />
          </div>

          {/* Animated logo orb */}
          <motion.div
            animate={{
              rotate: [0, 360],
              boxShadow: [
                `0 0 20px ${cfg.logoShadowBase},0.4), 0 0 40px ${cfg.logoShadowBase},0.2)`,
                `0 0 30px ${cfg.logoShadowBase},0.7), 0 0 60px ${cfg.logoShadowBase},0.35)`,
                `0 0 20px ${cfg.logoShadowBase},0.4), 0 0 40px ${cfg.logoShadowBase},0.2)`,
              ],
            }}
            transition={{
              rotate: { duration: 12, repeat: Infinity, ease: 'linear' },
              boxShadow: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' },
            }}
            className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: cfg.logoGradient }}
          >
            <LogoIcon size={28} className="text-white" style={{ filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.6))' }} />
          </motion.div>
        </div>

        {/* Change indicator */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex items-center gap-4 mb-6"
        >
          <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/15">
            <ArrowUpRight size={14} className="text-emerald-300" />
            <span className="font-body text-sm font-semibold text-emerald-300">+{change}% this month</span>
          </div>
          <div className="flex items-center gap-1.5">
            <LockedIcon size={13} className="text-white/50" />
            <span className="font-mono text-sm text-white/60">
              ₹{locked.toLocaleString('en-IN')} {cfg.lockedLabel}
            </span>
          </div>
        </motion.div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/15 to-transparent mb-6" />

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4">
          {cfg.stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + i * 0.12, type: 'spring', stiffness: 160, damping: 20 }}
              className="text-center group"
            >
              <div className="w-8 h-8 rounded-xl mx-auto mb-2 flex items-center justify-center"
                style={{ background: `${stat.color}25`, border: `1px solid ${stat.color}40` }}>
                <stat.icon size={14} style={{ color: stat.color }} />
              </div>
              <p className="font-mono font-bold text-base text-white" style={{ textShadow: `0 0 12px ${stat.color}60` }}>
                {stat.value}
              </p>
              <p className="font-body text-xs text-white/50 mt-0.5">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
