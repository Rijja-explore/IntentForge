import { useState } from 'react';
import Header from '../components/layout/Header';
import GlassCard from '../components/shared/GlassCard';
import TransactionCard from '../components/transactions/TransactionCard';
import FilterBar from '../components/transactions/FilterBar';
import EmptyState from '../components/transactions/EmptyState';
import LiveFeed from '../components/transactions/LiveFeed';
import { DEMO_TRANSACTIONS } from '../utils/constants';
import { BarChart2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const weeklyData = [
  { day: 'Mon', approved: 3200, blocked: 0 },
  { day: 'Tue', approved: 5400, blocked: 1000 },
  { day: 'Wed', approved: 2100, blocked: 500 },
  { day: 'Thu', approved: 7800, blocked: 2000 },
  { day: 'Fri', approved: 4200, blocked: 0 },
  { day: 'Sat', approved: 8900, blocked: 3000 },
  { day: 'Sun', approved: 3100, blocked: 0 },
];

export default function Transactions({ sidebarOpen, onMenuOpen }) {
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? DEMO_TRANSACTIONS : DEMO_TRANSACTIONS.filter(t => t.status === filter);

  return (
    <div>
      <Header title="Transactions" sidebarOpen={sidebarOpen} onMenuOpen={onMenuOpen} />
      <div className="p-4 md:p-6 space-y-6 pb-24 md:pb-6">

        {/* Weekly chart */}
        <GlassCard hover={false}>
          <div className="flex items-center gap-3 mb-4">
            <BarChart2 size={20} className="text-trust-electric" />
            <h3 className="font-display font-semibold text-lg text-slate-100">Weekly Overview</h3>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={weeklyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis dataKey="day" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: 'rgba(14,19,42,0.95)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: '12px' }}
                labelStyle={{ color: '#F1F5F9' }}
                formatter={(v) => `₹${v.toLocaleString('en-IN')}`}
              />
              <Bar dataKey="approved" fill="#10B981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="blocked" fill="#EF4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-success-emerald" />
              <span className="text-xs font-body text-slate-500">Approved</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-danger-crimson" />
              <span className="text-xs font-body text-slate-500">Blocked</span>
            </div>
          </div>
        </GlassCard>

        {/* Live feed */}
        <GlassCard hover={false}>
          <LiveFeed maxItems={10} />
        </GlassCard>

        {/* History */}
        <GlassCard hover={false}>
          <h3 className="font-display font-semibold text-lg text-slate-100 mb-4">Transaction History</h3>
          <FilterBar onFilter={setFilter} />
          <div className="mt-4 space-y-3">
            {filtered.length === 0 ? (
              <EmptyState message="No matching transactions" subtitle="Try a different filter" />
            ) : (
              filtered.map(tx => <TransactionCard key={tx.id} transaction={tx} />)
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
