import { motion } from 'framer-motion';
import Header from '../components/layout/Header';
import BalanceHero from '../components/wallet/BalanceHero';
import QuickStats from '../components/wallet/QuickStats';
import TrustScoreGauge from '../components/wallet/TrustScoreGauge';
import SpendingChart from '../components/wallet/SpendingChart';
import LiveFeed from '../components/transactions/LiveFeed';
import InsightsPanel from '../components/ai/InsightsPanel';
import GlassCard from '../components/shared/GlassCard';
import { containerVariants, cardVariants, heroEntrance } from '../utils/animations';
import { Sparkles, Zap, TrendingUp, Shield, AlertTriangle } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import { useCompliance } from '../hooks/useCompliance';
import { useWeb3 } from '../hooks/useWeb3';
import AutoProtectToggle from '../components/dashboard/AutoProtectToggle';

function SectionHeader({ icon: Icon, title, subtitle, color = '#7C3AED' }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}15`, border: `1px solid ${color}30` }}
      >
        <Icon size={15} style={{ color }} />
      </div>
      <div>
        <h3 className="font-display font-bold text-base text-slate-100">{title}</h3>
        {subtitle && <p className="text-xs font-body text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

function RiskBadge({ level }) {
  const cfg = {
    low:    { label: 'LOW RISK',    bg: 'rgba(5,150,105,0.12)',  border: 'rgba(5,150,105,0.3)',  color: '#34D399' },
    medium: { label: 'MEDIUM RISK', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)', color: '#FCD34D' },
    high:   { label: 'HIGH RISK',   bg: 'rgba(220,38,38,0.12)',  border: 'rgba(220,38,38,0.3)',  color: '#F87171' },
  };
  const c = cfg[level] || cfg.low;
  return (
    <span
      className="font-mono text-xs font-bold px-2.5 py-1 rounded-full"
      style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.color }}
    >
      {c.label}
    </span>
  );
}

export default function Dashboard({ sidebarOpen, onMenuOpen }) {
  const { wallet, loading: walletLoading } = useWallet();
  const { metrics, loading: metricsLoading } = useCompliance(wallet?.wallet_id);
  const { role } = useWeb3();

  const balance    = wallet?.balance ?? (role === 'receiver' ? 28500 : 125000);
  const trustScore = metrics ? Math.round((metrics.compliance_score ?? 0.87) * 100) : 87;
  const prevScore  = Math.max(0, trustScore - (metrics ? Math.round((metrics.score_delta ?? 0.05) * 100) : 5));
  const riskLevel  = metrics?.risk_level || 'low';
  const anomalyCount = metrics?.anomaly_count ?? 0;

  return (
    <div className="relative min-h-screen">
      <Header title="Dashboard" sidebarOpen={sidebarOpen} onMenuOpen={onMenuOpen} />
      <div className="relative z-10 p-4 md:p-6 space-y-6 pb-24 md:pb-6">

        {/* Balance Hero */}
        <motion.div {...heroEntrance}>
          <BalanceHero balance={balance} change={role === 'receiver' ? 8.2 : 12.5} locked={role === 'receiver' ? 2500 : 10000} role={role} />
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 120, damping: 20 }}
        >
          <QuickStats />
        </motion.div>

        {/* Auto-Protect Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <AutoProtectToggle walletId={wallet?.wallet_id} />
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
              <TrustScoreGauge score={trustScore} previousScore={prevScore} />
              {!metricsLoading && (
                <div className="mt-4 flex flex-col items-center gap-2">
                  <RiskBadge level={riskLevel} />
                  {anomalyCount > 0 && (
                    <div className="flex items-center gap-1.5 mt-1">
                      <AlertTriangle size={12} className="text-warning-amber" />
                      <span className="font-body text-xs text-warning-amber">
                        {anomalyCount} anomal{anomalyCount === 1 ? 'y' : 'ies'} detected
                      </span>
                    </div>
                  )}
                </div>
              )}
              {walletLoading && (
                <p className="font-mono text-xs text-slate-500 mt-3">Fetching wallet…</p>
              )}
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

        {/* Compliance Bar */}
        {metrics && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <GlassCard hover={false}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Shield size={16} style={{ color: '#7C3AED' }} />
                  <span className="font-display font-semibold text-sm text-slate-100">Compliance Score</span>
                </div>
                <span className="font-mono text-sm font-bold" style={{ color: '#A78BFA' }}>
                  {Math.round((metrics.compliance_score ?? 0.87) * 100)}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full" style={{ background: 'rgba(124,58,237,0.12)' }}>
                <motion.div
                  className="h-2 rounded-full"
                  style={{ background: 'linear-gradient(90deg, #7C3AED, #C026D3)' }}
                  initial={{ width: '0%' }}
                  animate={{ width: `${Math.round((metrics.compliance_score ?? 0.87) * 100)}%` }}
                  transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
                />
              </div>
              {metrics.insights && metrics.insights.length > 0 && (
                <p className="font-body text-xs text-slate-400 mt-2 italic">{metrics.insights[0]}</p>
              )}
            </GlassCard>
          </motion.div>
        )}

        {/* Live Feed + Insights */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <motion.div variants={cardVariants}>
            <GlassCard hover={false} className="min-h-[400px]">
              <SectionHeader icon={Zap} title="Live Transaction Feed" subtitle="Real-time updates" color="#F97316" />
              <LiveFeed maxItems={6} walletId={wallet?.wallet_id} />
            </GlassCard>
          </motion.div>

          <motion.div variants={cardVariants}>
            <GlassCard hover={false} gradient>
              <InsightsPanel role={role} />
            </GlassCard>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
