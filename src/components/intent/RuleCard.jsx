/* ─── RuleCard.jsx ───────────────────────────────────────────────────
 * Displays a single IntentRule.
 * Status badge: ACTIVE (green) / CLAIMED (violet) / EXPIRED (red)
 * Claim button: shown only to the receiver when status is ACTIVE.
 * ─────────────────────────────────────────────────────────────── */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle, AlertCircle, ArrowDownCircle, Loader } from 'lucide-react';
import { claimIntent } from '../../services/contractService';
import { formatEthAsInr } from '../../utils/formatters';

const STATUS_CFG = {
  ACTIVE:    { color: '#34D399', bg: 'rgba(52,211,153,0.12)',  border: 'rgba(52,211,153,0.3)'  },
  CLAIMED:   { color: '#A78BFA', bg: 'rgba(167,139,250,0.12)', border: 'rgba(167,139,250,0.3)' },
  EXPIRED:   { color: '#F87171', bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.3)' },
  NOT_FOUND: { color: '#64748B', bg: 'rgba(100,116,139,0.12)', border: 'rgba(100,116,139,0.2)' },
};

function shortenAddr(addr) {
  if (!addr) return '—';
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export default function RuleCard({ rule, isReceiver, onClaimed }) {
  const [claiming,  setClaiming]  = useState(false);
  const [claimTx,   setClaimTx]   = useState(null);
  const [claimError, setClaimError] = useState(null);

  if (!rule) return null;

  const st  = STATUS_CFG[rule.status] || STATUS_CFG.NOT_FOUND;
  const now = Math.floor(Date.now() / 1000);
  const secondsLeft = rule.expiry - now;
  const canClaim = isReceiver && rule.status === 'ACTIVE' && secondsLeft > 0;

  async function handleClaim() {
    setClaiming(true);
    setClaimError(null);
    setClaimTx(null);
    try {
      const { txHash } = await claimIntent(rule.ruleId);
      setClaimTx(txHash);
      onClaimed?.();
    } catch (err) {
      // Surface the revert reason if present
      const msg = err?.reason || err?.message || 'Transaction reverted';
      setClaimError(msg);
    } finally {
      setClaiming(false);
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="rounded-2xl p-4"
      style={{
        background: 'rgba(14,19,42,0.9)',
        border: `1px solid ${st.color}20`,
        boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
      }}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-mono text-slate-500 mb-1">Rule ID</p>
          <p className="font-mono text-xs text-slate-400 truncate">
            {rule.ruleId?.slice(0, 20)}…
          </p>
        </div>

        {/* Status badge */}
        <div
          className="flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full"
          style={{ background: st.bg, border: `1px solid ${st.border}` }}
        >
          {rule.status === 'ACTIVE'  && <CheckCircle  size={11} style={{ color: st.color }} />}
          {rule.status === 'CLAIMED' && <CheckCircle  size={11} style={{ color: st.color }} />}
          {rule.status === 'EXPIRED' && <AlertCircle  size={11} style={{ color: st.color }} />}
          <span className="font-mono text-[11px] font-bold" style={{ color: st.color }}>
            {rule.status}
          </span>
        </div>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <p className="text-[11px] font-mono text-slate-500">Amount</p>
          <p className="font-mono text-sm font-bold" style={{ color: '#FB923C' }}>
            {formatEthAsInr(rule.amount)}
          </p>
          <p className="font-mono text-[10px] text-slate-500">
            {parseFloat(rule.amount).toFixed(4)} ETH
          </p>
        </div>
        <div>
          <p className="text-[11px] font-mono text-slate-500">Expiry</p>
          <p className="font-mono text-xs text-slate-300">{rule.expiryDate}</p>
        </div>
        <div>
          <p className="text-[11px] font-mono text-slate-500">From</p>
          <p className="font-mono text-xs text-slate-300">{shortenAddr(rule.sender)}</p>
        </div>
        <div>
          <p className="text-[11px] font-mono text-slate-500">To</p>
          <p className="font-mono text-xs text-slate-300">{shortenAddr(rule.receiver)}</p>
        </div>
      </div>

      {/* Countdown for active rules */}
      {rule.status === 'ACTIVE' && (
        <div className="flex items-center gap-1.5 mb-3 text-[11px] font-mono text-slate-400">
          <Clock size={11} />
          <span>
            {secondsLeft > 0
              ? `${Math.floor(secondsLeft / 3600)}h ${Math.floor((secondsLeft % 3600) / 60)}m remaining`
              : 'Expired'}
          </span>
        </div>
      )}

      {/* Claim button (receiver only, active rules only) */}
      <AnimatePresence>
        {canClaim && !claimTx && (
          <motion.button
            key="claim-btn"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleClaim}
            disabled={claiming}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold"
            style={{
              background: 'linear-gradient(135deg, #059669, #047857)',
              color: 'white',
              border: '1px solid rgba(52,211,153,0.3)',
              opacity: claiming ? 0.7 : 1,
              cursor: claiming ? 'not-allowed' : 'pointer',
            }}
          >
            {claiming ? <Loader size={14} className="animate-spin" /> : <ArrowDownCircle size={14} />}
            {claiming ? 'Claiming…' : `Claim ${formatEthAsInr(rule.amount)}`}
          </motion.button>
        )}

        {claimTx && (
          <motion.div
            key="claim-success"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 py-2 px-3 rounded-xl"
            style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)' }}
          >
            <CheckCircle size={13} style={{ color: '#34D399' }} />
            <span className="font-mono text-xs" style={{ color: '#34D399' }}>
              Claimed! Tx: {claimTx.slice(0, 12)}…
            </span>
          </motion.div>
        )}

        {claimError && (
          <motion.div
            key="claim-error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-start gap-2 py-2 px-3 rounded-xl"
            style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)' }}
          >
            <AlertCircle size={13} style={{ color: '#F87171' }} className="mt-0.5 flex-shrink-0" />
            <span className="font-mono text-xs" style={{ color: '#F87171' }}>
              {claimError}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
