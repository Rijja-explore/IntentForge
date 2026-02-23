/* ─── ReceiverDashboard.jsx ─────────────────────────────────────────
 * Shown exclusively when Account 1 (Receiver) is connected.
 * Features:
 *   - List of all rules addressed to the receiver
 *   - Claim button on eligible (ACTIVE) rules
 *   - No rule-creation UI (enforced both here and on-chain)
 * ─────────────────────────────────────────────────────────────── */

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Inbox, RefreshCw, ShieldAlert, AlertTriangle } from 'lucide-react';
import RuleCard from './RuleCard';
import { getRulesForReceiver } from '../../services/contractService';

export default function ReceiverDashboard({ account, onBalanceRefresh }) {
  const [rules,    setRules]   = useState([]);
  const [loading,  setLoading] = useState(false);
  const [fetchErr, setFetchErr] = useState(null);

  const fetchRules = useCallback(async () => {
    if (!account) return;
    setLoading(true);
    setFetchErr(null);
    try {
      const all = await getRulesForReceiver(account);
      setRules(all);
    } catch (err) {
      setFetchErr(err.message || 'Failed to load rules');
    } finally {
      setLoading(false);
    }
  }, [account]);

  useEffect(() => { fetchRules(); }, [fetchRules]);

  function handleClaimed() {
    fetchRules();
    onBalanceRefresh?.();
  }

  const claimableCount = rules.filter((r) => r.status === 'ACTIVE').length;
  const expiredCount   = rules.filter((r) => r.status === 'EXPIRED').length;

  return (
    <div className="space-y-6">

      {/* Section header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.3)' }}
          >
            <Inbox size={15} style={{ color: '#34D399' }} />
          </div>
          <div>
            <h2 className="font-display font-bold text-lg text-slate-100">Receiver Dashboard</h2>
            <p className="text-xs text-slate-400">View and claim funds locked for you</p>
          </div>
        </div>

        {claimableCount > 0 && (
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono font-bold animate-pulse"
            style={{
              background: 'rgba(52,211,153,0.12)',
              border: '1px solid rgba(52,211,153,0.3)',
              color: '#34D399',
            }}
          >
            {claimableCount} claimable
          </div>
        )}
      </div>

      {/* Read-only notice */}
      <div
        className="flex items-start gap-3 p-3 rounded-xl"
        style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}
      >
        <ShieldAlert size={15} style={{ color: '#F59E0B' }} className="mt-0.5 flex-shrink-0" />
        <p className="text-xs text-slate-400">
          As the receiver you can only view rules and claim eligible funds.
          Rule creation is restricted to the lender (Account 0) and enforced on-chain.
        </p>
      </div>

      {/* Expired / violation warning */}
      {expiredCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 p-3.5 rounded-xl"
          style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.35)' }}
        >
          <AlertTriangle size={15} style={{ color: '#F87171' }} className="mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold" style={{ color: '#F87171' }}>
              {expiredCount} rule{expiredCount > 1 ? 's' : ''} expired unclaimed
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              The window to claim these funds has closed. Contact the lender to create a new rule if needed.
            </p>
          </div>
        </motion.div>
      )}

      {/* Rule list */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Inbox size={15} style={{ color: '#34D399' }} />
            <h3 className="font-display font-semibold text-sm text-slate-200">Received Rules</h3>
            <span className="font-mono text-xs text-slate-500">({rules.length})</span>
          </div>
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={fetchRules}
            disabled={loading}
            className="p-2 rounded-lg"
            style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.15)' }}
          >
            <RefreshCw size={13} style={{ color: '#34D399' }} className={loading ? 'animate-spin' : ''} />
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
            style={{ background: 'rgba(14,19,42,0.6)', border: '1px dashed rgba(52,211,153,0.15)' }}
          >
            <Inbox size={28} className="mx-auto mb-3 text-slate-600" />
            <p className="text-slate-400 text-sm font-medium">No rules yet</p>
            <p className="text-slate-600 text-xs mt-1">The lender hasn't sent any rules to your address</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {rules.map((rule) => (
              <RuleCard
                key={rule.ruleId}
                rule={rule}
                isReceiver={true}
                onClaimed={handleClaimed}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
