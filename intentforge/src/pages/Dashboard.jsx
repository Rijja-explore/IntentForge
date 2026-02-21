import { motion } from 'framer-motion';
import { useState } from 'react';
import Header from '../components/layout/Header';
import BalanceHero from '../components/wallet/BalanceHero';
import QuickStats from '../components/wallet/QuickStats';
import TrustScoreGauge from '../components/wallet/TrustScoreGauge';
import SpendingChart from '../components/wallet/SpendingChart';
import LiveFeed from '../components/transactions/LiveFeed';
import InsightsPanel from '../components/ai/InsightsPanel';
import GlassCard from '../components/shared/GlassCard';
import { containerVariants, cardVariants, heroEntrance } from '../utils/animations';
import { Sparkles, Zap, TrendingUp } from 'lucide-react';

function SectionHeader({ icon: Icon, title, subtitle, color = '#7C3AED' }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}15`, border: `1px solid ${color}30` }}
      >
        <Icon size={16} style={{ color }} />
      </div>
      <div>
        <h3 className="font-display font-bold text-base text-violet-950">{title}</h3>
        {subtitle && <p className="text-xs font-body text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [balance] = useState(50000);

  return (
    <div className="relative min-h-screen">
      {/* Aurora background */}
      <div className="aurora-bg" />

      <Header title="Dashboard" />
      <div className="relative z-10 p-4 md:p-6 space-y-6 pb-24 md:pb-6">

        {/* Balance Hero */}
        <motion.div {...heroEntrance}>
          <BalanceHero balance={balance} change={12.5} locked={10000} />
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 120, damping: 20 }}
        >
          <QuickStats />
        </motion.div>

        {/* Main grid: Trust + Spending */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Trust Score */}
          <motion.div variants={cardVariants}>
            <GlassCard className="flex flex-col items-center" glow glowColor="green" gradient>
              <SectionHeader icon={Sparkles} title="Trust Score" subtitle="Live financial health" color="#059669" />
              <TrustScoreGauge score={87} previousScore={82} />
            </GlassCard>
          </motion.div>

          {/* Spending Chart */}
          <motion.div variants={cardVariants} className="lg:col-span-2">
            <GlassCard gradient>
              <SectionHeader icon={TrendingUp} title="Spending Breakdown" subtitle="By category this month" color="#7C3AED" />
              <SpendingChart />
            </GlassCard>
          </motion.div>
        </motion.div>

        {/* Bottom grid: Feed + AI */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <motion.div variants={cardVariants}>
            <GlassCard hover={false} className="min-h-[400px]">
              <SectionHeader icon={Zap} title="Live Transaction Feed" subtitle="Real-time updates" color="#F97316" />
              <LiveFeed maxItems={6} />
            </GlassCard>
          </motion.div>

          <motion.div variants={cardVariants}>
            <GlassCard hover={false} gradient>
              <InsightsPanel />
            </GlassCard>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
