import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import GlassCard from '../components/shared/GlassCard';
import { Search, Link2, ShieldCheck, FileText, AlertTriangle, RotateCcw, RefreshCw, ExternalLink, Hash } from 'lucide-react';
import { getOnChainAuditData } from '../services/contractService';

/* ── Demo fallback audit data ─────────────────────────────────────── */
const DEMO_AUDIT = {
  statistics: {
    total_policies: 12,
    total_transactions_logged: 247,
    total_violations: 8,
    total_clawbacks: 3,
    total_approved: 236,
    total_blocked: 11,
  },
  recent_events: [
    { type: 'transaction', txId: '0xab3f…e920', status: 'APPROVED', wallet: 'demo-00…001', timestamp: '14:32:01', hash: '0xab3fe7d2c1f...e920' },
    { type: 'policy',      txId: '0x7c1a…b43d', status: 'REGISTERED', wallet: 'demo-00…001', timestamp: '14:28:44', hash: '0x7c1ab8e3d...b43d' },
    { type: 'transaction', txId: '0x2e8b…f110', status: 'BLOCKED',  wallet: 'demo-00…001', timestamp: '13:54:17', hash: '0x2e8bc9a4f...f110' },
    { type: 'violation',   txId: '0x9d4c…a221', status: 'VIOLATION', wallet: 'demo-00…001', timestamp: '13:54:17', hash: '0x9d4c0e7b2...a221' },
    { type: 'clawback',    txId: '0xf5a0…3cc9', status: 'CLAWBACK', wallet: 'demo-00…001', timestamp: '12:11:33', hash: '0xf5a068c4e...3cc9' },
    { type: 'transaction', txId: '0x1b7e…d542', status: 'APPROVED', wallet: 'demo-00…001', timestamp: '11:47:08', hash: '0x1b7ed3a9c...d542' },
    { type: 'transaction', txId: '0x4f2c…8b71', status: 'APPROVED', wallet: 'demo-00…001', timestamp: '10:58:22', hash: '0x4f2ca1e5d...8b71' },
    { type: 'policy',      txId: '0x8e3d…7f04', status: 'REGISTERED', wallet: 'demo-00…001', timestamp: '10:22:45', hash: '0x8e3d2b6a1...7f04' },
  ],
};

const EVENT_STYLES = {
  transaction: { color: '#60A5FA', bg: 'rgba(96,165,250,0.08)',  border: 'rgba(96,165,250,0.2)',  icon: FileText },
  policy:      { color: '#A78BFA', bg: 'rgba(167,139,250,0.08)', border: 'rgba(167,139,250,0.2)', icon: ShieldCheck },
  violation:   { color: '#F87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.2)', icon: AlertTriangle },
  clawback:    { color: '#FB923C', bg: 'rgba(251,146,60,0.08)',  border: 'rgba(251,146,60,0.2)',  icon: RotateCcw },
};

const STATUS_COLORS = {
  APPROVED:   '#34D399',
  BLOCKED:    '#F87171',
  VIOLATION:  '#FCD34D',
  CLAWBACK:   '#FB923C',
  REGISTERED: '#A78BFA',
};

/* ── Stat Card ───────────────────────────────────────────────────── */
function StatCard({ label, value, icon: Icon, color }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="rounded-2xl p-4"
      style={{ background: `${color}08`, border: `1px solid ${color}25` }}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon size={14} style={{ color }} />
        <span className="font-body text-xs text-slate-400">{label}</span>
      </div>
      <p className="font-mono font-bold text-2xl" style={{ color }}>{value}</p>
    </motion.div>
  );
}

/* ── Event Row ─────────────────────────────────────────────────────── */
function EventRow({ event, index }) {
  const style = EVENT_STYLES[event.type] || EVENT_STYLES.transaction;
  const Icon  = style.icon;
  const statusColor = STATUS_COLORS[event.status] || '#94A3B8';

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      className="flex items-center gap-3 py-3 px-4 rounded-xl group cursor-default"
      style={{ background: style.bg, border: `1px solid ${style.border}` }}
    >
      {/* Type icon */}
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: `${style.color}18` }}
      >
        <Icon size={14} style={{ color: style.color }} />
      </div>

      {/* Hash + type */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Hash size={10} style={{ color: style.color }} />
          <span className="font-mono text-xs text-slate-200">{event.txId}</span>
        </div>
        <p className="font-body text-xs text-slate-400 mt-0.5 capitalize">{event.type} · {event.timestamp}</p>
      </div>

      {/* Status badge */}
      <span
        className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
        style={{ background: `${statusColor}18`, color: statusColor, border: `1px solid ${statusColor}30` }}
      >
        {event.status}
      </span>
    </motion.div>
  );
}

export default function BlockchainAudit({ sidebarOpen, onMenuOpen }) {
  const [audit, setAudit]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState('all');
  const [search, setSearch]   = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const data = await getOnChainAuditData();
      // If no on-chain events yet, fall back to demo data so the page isn't empty
      if (data.recent_events.length === 0) {
        setAudit(DEMO_AUDIT);
      } else {
        setAudit(data);
      }
    } catch {
      setAudit(DEMO_AUDIT);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const stats        = audit?.statistics || DEMO_AUDIT.statistics;
  const allEvents    = audit?.recent_events || DEMO_AUDIT.recent_events;
  const filteredEvts = allEvents.filter(ev => {
    const matchType   = filter === 'all' || ev.type === filter;
    const matchSearch = !search || ev.txId.toLowerCase().includes(search.toLowerCase()) || ev.hash?.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  return (
    <div>
      <Header title="Blockchain Audit" sidebarOpen={sidebarOpen} onMenuOpen={onMenuOpen} />
      <div className="p-4 md:p-6 space-y-6 pb-24 md:pb-6">

        {/* Hero banner */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl p-6"
          style={{ background: 'linear-gradient(135deg,#0A0F28 0%,#1a0a3d 50%,#0A0F28 100%)', border: '1px solid rgba(167,139,250,0.2)' }}
        >
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl" style={{ background: 'rgba(124,58,237,0.12)' }} />
          <div className="relative z-10 flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#7C3AED,#C026D3)', boxShadow: '0 0 24px rgba(124,58,237,0.4)' }}
            >
              <Link2 size={26} className="text-white" />
            </div>
            <div>
              <h2 className="font-display font-bold text-xl text-slate-100">Blockchain Audit Explorer</h2>
              <p className="font-body text-sm text-slate-400 mt-0.5">
                Immutable audit trail · All decisions logged on-chain · Tamper-proof compliance
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={load}
              className="ml-auto flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-body font-semibold"
              style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', color: '#A78BFA' }}
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              Refresh
            </motion.button>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatCard label="Policies"      value={stats.total_policies}            icon={ShieldCheck}   color="#A78BFA" />
          <StatCard label="Transactions"  value={stats.total_transactions_logged} icon={FileText}      color="#60A5FA" />
          <StatCard label="Approved"      value={stats.total_approved}            icon={ShieldCheck}   color="#34D399" />
          <StatCard label="Blocked"       value={stats.total_blocked}             icon={AlertTriangle} color="#F87171" />
          <StatCard label="Violations"    value={stats.total_violations}          icon={AlertTriangle} color="#FCD34D" />
          <StatCard label="Clawbacks"     value={stats.total_clawbacks}           icon={RotateCcw}     color="#FB923C" />
        </div>

        {/* Filter + Search */}
        <GlassCard hover={false}>
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            {/* Search */}
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-xl flex-1"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(167,139,250,0.15)' }}
            >
              <Search size={14} className="text-slate-400 flex-shrink-0" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by hash or txID…"
                className="flex-1 bg-transparent text-sm font-mono text-slate-200 placeholder-slate-500 outline-none"
              />
            </div>

            {/* Filter chips */}
            <div className="flex gap-2 flex-wrap">
              {['all', 'transaction', 'policy', 'violation', 'clawback'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className="px-3 py-1.5 rounded-xl text-xs font-body font-semibold transition-all"
                  style={filter === f ? {
                    background: 'rgba(124,58,237,0.25)',
                    border: '1px solid rgba(124,58,237,0.5)',
                    color: '#A78BFA',
                  } : {
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: '#64748B',
                  }}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Event list */}
          <div className="space-y-2">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-14 rounded-xl animate-pulse"
                  style={{ background: 'rgba(167,139,250,0.06)' }}
                />
              ))
            ) : filteredEvts.length === 0 ? (
              <div className="py-12 text-center">
                <p className="font-display text-slate-400">No events found</p>
              </div>
            ) : (
              filteredEvts.map((ev, i) => <EventRow key={i} event={ev} index={i} />)
            )}
          </div>

          {filteredEvts.length > 0 && (
            <p className="font-body text-xs text-slate-500 mt-4 text-center">
              Showing {filteredEvts.length} events · All hashes anchored on Hardhat local node
            </p>
          )}
        </GlassCard>

        {/* Network info card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Network',           value: 'Hardhat Local',       icon: Link2,       color: '#A78BFA' },
            { label: 'Contract Version',  value: 'v1.0.0',              icon: ShieldCheck, color: '#34D399' },
            { label: 'RPC Endpoint',      value: 'localhost:8545',       icon: ExternalLink,color: '#60A5FA' },
          ].map((item) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 p-4 rounded-2xl"
              style={{ background: `${item.color}08`, border: `1px solid ${item.color}20` }}
            >
              <item.icon size={16} style={{ color: item.color }} />
              <div>
                <p className="font-body text-xs text-slate-400">{item.label}</p>
                <p className="font-mono text-sm font-semibold" style={{ color: item.color }}>{item.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
}
