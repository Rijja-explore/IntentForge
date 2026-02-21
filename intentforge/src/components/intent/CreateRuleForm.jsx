/* ─── CreateRuleForm.jsx ─────────────────────────────────────────────
 * Lender-only form to create a new restricted intent rule.
 * Calls contractService.createIntent() — contract enforces all logic.
 * ─────────────────────────────────────────────────────────────── */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, CheckCircle, AlertCircle, Loader, Clock, Wallet, ArrowRight } from 'lucide-react';
import { createIntent } from '../../services/contractService';
import { RECEIVER_ADDRESS } from '../../config/contracts';
import { formatEthAsInr } from '../../utils/formatters';

const EXPIRY_OPTIONS = [
  { label: '5 minutes',  value: 300   },
  { label: '1 hour',     value: 3600  },
  { label: '12 hours',   value: 43200 },
  { label: '1 day',      value: 86400 },
  { label: '7 days',     value: 604800},
];

export default function CreateRuleForm({ onRuleCreated }) {
  // Default to the known receiver address for convenience
  const [receiver,  setReceiver]  = useState(RECEIVER_ADDRESS);
  const [ethAmount, setEthAmount] = useState('0.01');
  const [expiry,    setExpiry]    = useState(3600); // 1 hour default

  const [submitting, setSubmitting] = useState(false);
  const [result,     setResult]     = useState(null);  // { ruleId, txHash }
  const [error,      setError]      = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);
    setError(null);

    try {
      const res = await createIntent(receiver, expiry, ethAmount);
      setResult(res);
      onRuleCreated?.();
      // Reset form
      setEthAmount('0.01');
    } catch (err) {
      const msg = err?.reason || err?.message || 'Transaction failed';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-5"
      style={{
        background: 'rgba(14,19,42,0.95)',
        border: '1px solid rgba(167,139,250,0.2)',
        boxShadow: '0 8px 32px rgba(124,58,237,0.1)',
      }}
    >
      <div className="flex items-center gap-3 mb-5">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(167,139,250,0.3)' }}
        >
          <Zap size={15} style={{ color: '#A78BFA' }} />
        </div>
        <div>
          <h3 className="font-display font-bold text-base text-slate-100">Create Restricted Rule</h3>
          <p className="text-xs text-slate-400">Lock ETH with expiry — receiver can claim on-chain</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Receiver address */}
        <div>
          <label className="block text-xs font-mono text-slate-400 mb-1.5">
            <Wallet size={11} className="inline mr-1" />
            Receiver Address
          </label>
          <input
            type="text"
            value={receiver}
            onChange={(e) => setReceiver(e.target.value)}
            placeholder="0x..."
            className="w-full px-3 py-2.5 rounded-xl font-mono text-sm text-slate-200 outline-none focus:ring-1"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(167,139,250,0.2)',
              WebkitRingColor: '#7C3AED',
            }}
            required
          />
          <p className="text-[11px] font-mono text-slate-600 mt-1">
            Pre-filled: Receiver (Account 1)
          </p>
        </div>

        {/* ETH amount */}
        <div>
          <label className="block text-xs font-mono text-slate-400 mb-1.5">
            ETH Amount to Lock
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.001"
              min="0.001"
              value={ethAmount}
              onChange={(e) => setEthAmount(e.target.value)}
              className="w-full px-3 py-2.5 pr-16 rounded-xl font-mono text-sm text-slate-200 outline-none"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(249,115,22,0.25)',
              }}
              required
            />
            <span
              className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-xs font-bold"
              style={{ color: '#FB923C' }}
            >
              ETH
            </span>
          </div>
          {ethAmount && (
            <p className="text-[11px] font-mono mt-1.5" style={{ color: '#FB923C' }}>
              ≈ {formatEthAsInr(ethAmount)} at current rate
            </p>
          )}
        </div>

        {/* Expiry picker */}
        <div>
          <label className="block text-xs font-mono text-slate-400 mb-1.5">
            <Clock size={11} className="inline mr-1" />
            Rule Expiry
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {EXPIRY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setExpiry(opt.value)}
                className="py-2 px-2 rounded-xl text-[11px] font-mono font-semibold transition-all"
                style={{
                  background: expiry === opt.value ? 'rgba(124,58,237,0.25)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${expiry === opt.value ? 'rgba(167,139,250,0.5)' : 'rgba(255,255,255,0.08)'}`,
                  color:  expiry === opt.value ? '#A78BFA' : '#64748B',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <motion.button
          type="submit"
          disabled={submitting}
          whileHover={{ scale: submitting ? 1 : 1.02 }}
          whileTap={{  scale: submitting ? 1 : 0.97 }}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold"
          style={{
            background: 'linear-gradient(135deg, #7C3AED, #5B21B6)',
            color: 'white',
            border: '1px solid rgba(167,139,250,0.3)',
            opacity: submitting ? 0.7 : 1,
            cursor: submitting ? 'not-allowed' : 'pointer',
          }}
        >
          {submitting
            ? <><Loader size={15} className="animate-spin" /> Locking ETH…</>
            : <><Zap size={15} /> Create Rule  <ArrowRight size={13} /></>
          }
        </motion.button>
      </form>

      {/* Feedback */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 p-3 rounded-xl"
            style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.25)' }}
          >
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle size={14} style={{ color: '#34D399' }} />
              <span className="text-sm font-semibold" style={{ color: '#34D399' }}>Rule Created</span>
            </div>
            <p className="font-mono text-[11px] text-slate-400 break-all">
              Rule ID: {result.ruleId ? `${result.ruleId.slice(0, 18)}…` : 'deployed'}
            </p>
            <p className="font-mono text-[11px] text-slate-500 break-all mt-0.5">
              Tx: {result.txHash}
            </p>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 p-3 rounded-xl"
            style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)' }}
          >
            <div className="flex items-start gap-2">
              <AlertCircle size={14} style={{ color: '#F87171' }} className="mt-0.5 flex-shrink-0" />
              <span className="font-mono text-xs" style={{ color: '#F87171' }}>{error}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
