import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '../components/layout/Header';
import GlassCard from '../components/shared/GlassCard';
import TransactionCard from '../components/transactions/TransactionCard';
import FilterBar from '../components/transactions/FilterBar';
import EmptyState from '../components/transactions/EmptyState';
import LiveFeed from '../components/transactions/LiveFeed';
import TransactionSimulator from '../components/transactions/TransactionSimulator';
import UPISimulator from '../components/transactions/UPISimulator';
import { DEMO_TRANSACTIONS } from '../utils/constants';
import { BarChart2, Zap, Activity, Smartphone } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useWallet } from '../hooks/useWallet';
import { useTransactions } from '../hooks/useTransactions';

const STATIC_WEEKLY = [
  { day: 'Mon', approved: 3200, blocked: 0 },
  { day: 'Tue', approved: 5400, blocked: 1000 },
  { day: 'Wed', approved: 2100, blocked: 500 },
  { day: 'Thu', approved: 7800, blocked: 2000 },
  { day: 'Fri', approved: 4200, blocked: 0 },
  { day: 'Sat', approved: 8900, blocked: 3000 },
  { day: 'Sun', approved: 3100, blocked: 0 },
];

function computeWeeklyData(txns) {
  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const data = DAYS.map(d => ({ day: d, approved: 0, blocked: 0 }));
  txns.forEach(t => {
    const ts = t.timestamp ? new Date(t.timestamp) : null;
    if (!ts || isNaN(ts)) return;
    const dayIdx = (ts.getDay() + 6) % 7; // 0 = Mon, 6 = Sun
    const amt = parseFloat(t.amount) || 0;
    if ((t.status || '').toLowerCase() === 'blocked' || (t.status || '').toLowerCase() === 'violation') {
      data[dayIdx].blocked += amt;
    } else {
      data[dayIdx].approved += amt;
    }
  });
  return data;
}

export default function Transactions({ sidebarOpen, onMenuOpen }) {
  const [filter, setFilter]             = useState('all');
  const [simulatorTab, setSimulatorTab] = useState('standard'); // 'standard' | 'upi'
  const { wallet } = useWallet();
  const { transactions: liveTransactions } = useTransactions(wallet?.wallet_id);

  const allTransactions = liveTransactions.length > 0 ? liveTransactions : DEMO_TRANSACTIONS;
  const filtered = filter === 'all'
    ? allTransactions
    : allTransactions.filter(t => (t.status || '').toLowerCase() === filter.toLowerCase());

  // Compute weekly chart data from real transactions; fall back to static if insufficient data
  const weeklyData = useMemo(() => {
    const computed = computeWeeklyData(allTransactions);
    const hasData = computed.some(d => d.approved > 0 || d.blocked > 0);
    return hasData ? computed : STATIC_WEEKLY;
  }, [allTransactions]);

  return (
    <div>
      <Header title="Transactions" sidebarOpen={sidebarOpen} onMenuOpen={onMenuOpen} />
      <div className="p-4 md:p-6 space-y-6 pb-24 md:pb-6">

        {/* Weekly chart */}
        <GlassCard hover={false}>
          <div className="flex items-center gap-3 mb-4">
            <BarChart2 size={18} className="text-trust-electric" />
            <h3 className="font-display font-semibold text-lg text-slate-100">Weekly Activity</h3>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={weeklyData} barGap={4}>
              <XAxis dataKey="day" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  background: 'rgba(14,19,42,0.95)',
                  border: '1px solid rgba(167,139,250,0.2)',
                  borderRadius: '12px',
                  fontFamily: 'monospace',
                }}
                formatter={(v) => [`₹${v.toLocaleString('en-IN')}`, '']}
                labelStyle={{ color: '#F1F5F9', fontWeight: 600 }}
              />
              <Bar dataKey="approved" fill="#7C3AED" radius={[4, 4, 0, 0]} maxBarSize={28} />
              <Bar dataKey="blocked"  fill="#DC2626" radius={[4, 4, 0, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-6 mt-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-trust-electric" />
              <span className="text-xs font-body text-slate-500">Approved</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-danger-crimson" />
              <span className="text-xs font-body text-slate-500">Blocked</span>
            </div>
          </div>
        </GlassCard>

        {/* Two-column: Simulator + Live Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Live Transaction Validator — with Standard / UPI tabs */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {simulatorTab === 'upi'
                  ? <Smartphone size={16} className="text-success-emerald" />
                  : <Zap size={16} className="text-money-gold" />}
                <h3 className="font-display font-semibold text-sm text-slate-300 uppercase tracking-wider">Live Validator</h3>
              </div>
              {/* Tab pills */}
              <div
                className="flex items-center gap-1 p-0.5 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <button
                  onClick={() => setSimulatorTab('standard')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-xs font-mono font-semibold transition-all"
                  style={{
                    background: simulatorTab === 'standard' ? 'rgba(251,146,60,0.15)' : 'transparent',
                    color:      simulatorTab === 'standard' ? '#FB923C'                : '#64748B',
                    border:     simulatorTab === 'standard' ? '1px solid rgba(251,146,60,0.3)' : '1px solid transparent',
                  }}
                >
                  <Zap size={11} />
                  Standard
                </button>
                <button
                  onClick={() => setSimulatorTab('upi')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-xs font-mono font-semibold transition-all"
                  style={{
                    background: simulatorTab === 'upi' ? 'rgba(34,197,94,0.12)' : 'transparent',
                    color:      simulatorTab === 'upi' ? '#22C55E'               : '#64748B',
                    border:     simulatorTab === 'upi' ? '1px solid rgba(34,197,94,0.28)' : '1px solid transparent',
                  }}
                >
                  <Smartphone size={11} />
                  UPI
                </button>
              </div>
            </div>
            <AnimatePresence mode="wait">
              {simulatorTab === 'standard' ? (
                <motion.div
                  key="standard"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.18 }}
                >
                  <TransactionSimulator />
                </motion.div>
              ) : (
                <motion.div
                  key="upi"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.18 }}
                >
                  <UPISimulator />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Live Feed */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Activity size={16} className="text-trust-electric" />
              <h3 className="font-display font-semibold text-sm text-slate-300 uppercase tracking-wider">Activity Feed</h3>
            </div>
            <GlassCard hover={false}>
              <LiveFeed maxItems={8} walletId={wallet?.wallet_id} />
            </GlassCard>
          </div>
        </div>

        {/* Transaction History */}
        <GlassCard hover={false}>
          <h3 className="font-display font-semibold text-lg text-slate-100 mb-4">Transaction History</h3>
          <FilterBar onFilter={setFilter} />
          <div className="mt-4 space-y-3">
            {filtered.length === 0 ? (
              <EmptyState filter={filter} />
            ) : (
              filtered.map((txn, i) => (
                <motion.div
                  key={txn.id || i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <TransactionCard transaction={txn} />
                </motion.div>
              ))
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
