/* ─── LenderDashboard.jsx ──────────────────────────────────────────
 * Shown exclusively when Account 0 (Lender) is connected.
 * Features:
 *   - Create Rule form
 *   - Live list of all rules sent by the lender
 * ─────────────────────────────────────────────────────────────── */

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Zap, RefreshCw, ListChecks, AlertTriangle } from 'lucide-react';
import CreateRuleForm from './CreateRuleForm';
import RuleCard from './RuleCard';
import { getUserRules } from '../../services/contractService';

export default function LenderDashboard({ account, onBalanceRefresh }) {
  const [rules,     setRules]    = useState([]);
  const [loading,   setLoading]  = useState(false);
  const [fetchErr,  setFetchErr] = useState(null);

  const fetchRules = useCallback(async () => {
    if (!account) return;
    setLoading(true);
    setFetchErr(null);
    try {
      const all = await getUserRules(account);
      // Lender sees rules where they are the sender
      setRules(all.filter((r) => r.sender?.toLowerCase() === account.toLowerCase()));
    } catch (err) {
      setFetchErr(err.message || 'Failed to load rules');
    } finally {
      setLoading(false);
    }
  }, [account]);

  useEffect(() => { fetchRules(); }, [fetchRules]);

  function handleRuleCreated() {
    fetchRules();
    onBalanceRefresh?.();
  }

  const activeCount  = rules.filter((r) => r.status === 'ACTIVE').length;
  const claimedCount = rules.filter((r) => r.status === 'CLAIMED').length;
  const expiredCount = rules.filter((r) => r.status === 'EXPIRED').length;

  return (
    <div className="space-y-6">

      {/* Section header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(167,139,250,0.3)' }}
          >
            <Zap size={15} style={{ color: '#A78BFA' }} />
          </div>
          <div>
            <h2 className="font-display font-bold text-lg text-slate-100">Lender Dashboard</h2>
            <p className="text-xs text-slate-400">Create rules and monitor locked funds</p>
          </div>
        </div>

        {/* Stats pills */}
        <div className="flex gap-2">
          {[
            { label: 'Active',  count: activeCount,  color: '#34D399' },
            { label: 'Claimed', count: claimedCount, color: '#A78BFA' },
            { label: 'Expired', count: expiredCount, color: '#F87171' },
          ].map(({ label, count, color }) => (
            <div
              key={label}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-semibold"
              style={{
                background: `${color}12`,
                border: `1px solid ${color}25`,
                color,
              }}
            >
              {count} {label}
            </div>
          ))}
        </div>
      </div>

      {/* Create rule form */}
      <CreateRuleForm onRuleCreated={handleRuleCreated} />

      {/* Rule list */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ListChecks size={15} style={{ color: '#A78BFA' }} />
            <h3 className="font-display font-semibold text-sm text-slate-200">Sent Rules</h3>
            <span className="font-mono text-xs text-slate-500">({rules.length})</span>
          </div>
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={fetchRules}
            disabled={loading}
            className="p-2 rounded-lg"
            style={{ background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.15)' }}
          >
            <RefreshCw size={13} style={{ color: '#A78BFA' }} className={loading ? 'animate-spin' : ''} />
          </motion.button>
        </div>

        {loading && rules.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm">Loading rules…</div>
        ) : fetchErr ? (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3 p-4 rounded-xl"
            style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.3)' }}
          >
            <AlertTriangle size={15} style={{ color: '#F87171' }} className="mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold" style={{ color: '#F87171' }}>Could not load rules</p>
              <p className="text-xs text-slate-500 mt-0.5">{fetchErr}</p>
            </div>
          </motion.div>
        ) : rules.length === 0 ? (
          <div
            className="text-center py-12 rounded-2xl"
            style={{ background: 'rgba(14,19,42,0.6)', border: '1px dashed rgba(167,139,250,0.15)' }}
          >
            <Zap size={28} className="mx-auto mb-3 text-slate-600" />
            <p className="text-slate-400 text-sm font-medium">No rules yet</p>
            <p className="text-slate-600 text-xs mt-1">Create your first rule above to lock ETH</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {rules.map((rule) => (
              <RuleCard
                key={rule.ruleId}
                rule={rule}
                isReceiver={false}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
