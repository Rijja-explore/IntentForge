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
import { containerVariants, cardVariants } from '../utils/animations';

export default function Dashboard() {
  const [balance] = useState(50000);

  return (
    <div>
      <Header title="Dashboard" />
      <div className="p-4 md:p-6 space-y-6 pb-24 md:pb-6">

        {/* Balance Hero */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <BalanceHero balance={balance} change={12.5} locked={10000} />
        </motion.div>

        {/* Quick Stats */}
        <QuickStats />

        {/* Main grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Trust Score */}
          <motion.div variants={cardVariants}>
            <GlassCard className="flex flex-col items-center" glow glowColor="green">
              <h3 className="font-display font-semibold text-lg text-violet-950 mb-4 self-start">Trust Score</h3>
              <TrustScoreGauge score={87} previousScore={82} />
            </GlassCard>
          </motion.div>

          {/* Spending Chart */}
          <motion.div variants={cardVariants} className="lg:col-span-2">
            <GlassCard>
              <h3 className="font-display font-semibold text-lg text-violet-950 mb-4">Spending Breakdown</h3>
              <SpendingChart />
            </GlassCard>
          </motion.div>
        </motion.div>

        {/* Bottom grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Live Feed */}
          <GlassCard hover={false} className="min-h-[400px]">
            <LiveFeed maxItems={6} />
          </GlassCard>

          {/* AI Insights */}
          <GlassCard hover={false}>
            <InsightsPanel />
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
