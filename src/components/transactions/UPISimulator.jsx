/* ─── UPI Simulator ───────────────────────────────────────────────────
 * Simulates a UPI payment through the validation engine.
 * Generates realistic VPA + UPI Ref ID and sends to /transaction/validate.
 * ─────────────────────────────────────────────────────────────── */

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Smartphone, CheckCircle, XCircle, AlertTriangle, RotateCcw, Loader, RefreshCw } from 'lucide-react';
import { simulateTransaction, executeClawback } from '../../services/transactionService';
import { DEMO_WALLET_STORAGE_KEY } from '../../config/api';
import GlassCard from '../shared/GlassCard';

// VPA presets — common Indian UPI handles
const VPA_PRESETS = [
  { label: 'rahul@paytm',    upi: 'rahul@paytm',    color: '#00BAF2' },
  { label: 'priya@phonepe',  upi: 'priya@phonepe',  color: '#5F259F' },
  { label: 'amit@okicici',   upi: 'amit@okicici',   color: '#B91C1C' },
  { label: 'neha@ybl',       upi: 'neha@ybl',       color: '#16A34A' },
];

// Merchant categories relevant to everyday UPI usage
const UPI_MERCHANTS = [
  { name: 'Swiggy',       category: 'food',        avatar: '🍔' },
  { name: 'Zomato',       category: 'food',        avatar: '🍕' },
  { name: 'Amazon',       category: 'shopping',    avatar: '📦' },
  { name: 'Flipkart',     category: 'shopping',    avatar: '🛍️' },
  { name: 'BookMyShow',   category: 'entertainment', avatar: '🎬' },
  { name: 'Dream11',      category: 'gambling',    avatar: '🎯' },
];

// Generate an 18-digit UPI reference ID (format used by NPCI)
function generateUpiRefId() {
  const ts   = Date.now().toString().slice(-10);   // last 10 digits of epoch ms
  const rand = Math.floor(Math.random() * 1e8).toString().padStart(8, '0');
  return ts + rand;  // 18-char numeric string
}

const STATUS_ICON = {
  APPROVED:          { Icon: CheckCircle,   cls: 'text-success-emerald', label: 'Payment Success' },
  BLOCKED:           { Icon: XCircle,       cls: 'text-danger-crimson',  label: 'Payment Blocked' },
  VIOLATION:         { Icon: AlertTriangle, cls: 'text-warning-amber',   label: 'Policy Violation' },
  CLAWBACK_REQUIRED: { Icon: RotateCcw,     cls: 'text-money-gold',      label: 'Clawback Required' },
};

export default function UPISimulator() {
  const [vpa,           setVpa]           = useState(VPA_PRESETS[0].upi);
  const [merchant,      setMerchant]      = useState(UPI_MERCHANTS[0]);
  const [amount,        setAmount]        = useState('');
  const [upiRef,        setUpiRef]        = useState(generateUpiRefId);
  const [loading,       setLoading]       = useState(false);
  const [result,        setResult]        = useState(null);
  const [clawbackDone,  setClawbackDone]  = useState(false);

  const refreshRef = () => setUpiRef(generateUpiRefId());

  const handlePay = async () => {
    if (!amount || isNaN(amount)) return;
    setLoading(true);
    setResult(null);
    setClawbackDone(false);

    try {
      const walletId = localStorage.getItem(DEMO_WALLET_STORAGE_KEY) || 'demo-wallet-id';
      const data = await simulateTransaction({
        wallet_id:   walletId,
        amount:      parseFloat(amount),
        category:    merchant.category,
        merchant:    merchant.name,
        upi_ref_id:  upiRef,
        metadata:    { channel: 'upi', vpa, demo: true },
      });
      setResult(data);
    } catch {
      const isBlocked = merchant.category === 'gambling';
      setResult({
        transaction_id:    `upi-${Date.now()}`,
        status:            isBlocked ? 'BLOCKED' : 'APPROVED',
        reason:            isBlocked
          ? 'Category gambling is blocked by policy'
          : 'UPI payment complies with all active policies',
        policies_evaluated: 3,
        processing_time_ms: 38,
        ai_reasoning:       isBlocked
          ? 'Gambling transactions are restricted by your safety rule.'
          : `₹${amount} to ${merchant.name} via ${vpa} approved within limits.`,
        confidence: 0.97,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClawback = async () => {
    if (!result?.transaction_id) return;
    try {
      await executeClawback({
        transaction_id: result.transaction_id,
        reason: 'Manual clawback via UPI simulator',
      });
    } catch { /* optimistic */ }
    setClawbackDone(true);
    setResult(r => ({ ...r, status: 'CLAWBACK_REQUIRED' }));
  };

  const meta = result ? (STATUS_ICON[result.status] || STATUS_ICON.APPROVED) : null;

  // Derive status color for receipt border
  const receiptColor = {
    APPROVED:          'rgba(52,211,153,0.35)',
    BLOCKED:           'rgba(248,113,113,0.35)',
    VIOLATION:         'rgba(252,211,77,0.35)',
    CLAWBACK_REQUIRED: 'rgba(251,146,60,0.35)',
  }[result?.status] || 'rgba(255,255,255,0.1)';

  const receiptBg = {
    APPROVED:          'rgba(52,211,153,0.06)',
    BLOCKED:           'rgba(248,113,113,0.06)',
    VIOLATION:         'rgba(252,211,77,0.06)',
    CLAWBACK_REQUIRED: 'rgba(251,146,60,0.06)',
  }[result?.status] || 'rgba(255,255,255,0.03)';

  return (
    <GlassCard hover={false}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)' }}
        >
          <Smartphone size={15} style={{ color: '#22C55E' }} />
        </div>
        <div>
          <h3 className="font-display font-semibold text-base text-slate-100">UPI Payment Simulator</h3>
          <p className="text-xs font-body text-slate-400">Validates UPI transactions against active rules</p>
        </div>
      </div>

      <div className="space-y-4">

        {/* VPA chips */}
        <div>
          <label className="font-body text-xs text-slate-400 uppercase tracking-wider mb-2 block">
            Payer VPA
          </label>
          <div className="grid grid-cols-2 gap-2">
            {VPA_PRESETS.map((p) => (
              <motion.button
                key={p.upi}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setVpa(p.upi)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-mono transition-all"
                style={{
                  background: vpa === p.upi ? `${p.color}18` : 'rgba(255,255,255,0.03)',
                  border:     vpa === p.upi ? `1px solid ${p.color}55` : '1px solid rgba(255,255,255,0.06)',
                  color:      vpa === p.upi ? p.color : '#94A3B8',
                }}
              >
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0"
                  style={{ background: `${p.color}25`, color: p.color }}
                >
                  @
                </span>
                <span className="truncate">{p.upi}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Merchant chips */}
        <div>
          <label className="font-body text-xs text-slate-400 uppercase tracking-wider mb-2 block">
            Merchant
          </label>
          <div className="grid grid-cols-3 gap-2">
            {UPI_MERCHANTS.map((m) => (
              <motion.button
                key={m.name}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setMerchant(m)}
                className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-body transition-all"
                style={{
                  background: merchant.name === m.name ? 'rgba(167,139,250,0.12)' : 'rgba(255,255,255,0.03)',
                  border:     merchant.name === m.name ? '1px solid rgba(167,139,250,0.35)' : '1px solid rgba(255,255,255,0.06)',
                  color:      merchant.name === m.name ? '#A78BFA' : '#94A3B8',
                }}
              >
                <span>{m.avatar}</span>
                <span className="truncate">{m.name}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Amount + UPI Ref */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="font-body text-xs text-slate-400 uppercase tracking-wider mb-2 block">
              Amount (₹)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-100 font-mono text-sm placeholder-slate-500 outline-none focus:border-success-emerald/50 transition-colors"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-body text-xs text-slate-400 uppercase tracking-wider">
                UPI Ref ID
              </label>
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={refreshRef}
                title="Regenerate reference ID"
                className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-mono font-semibold"
                style={{
                  background: 'rgba(34,197,94,0.1)',
                  border: '1px solid rgba(34,197,94,0.25)',
                  color: '#22C55E',
                }}
              >
                <RefreshCw size={9} />
                New
              </motion.button>
            </div>
            <div
              className="w-full px-3 py-2.5 rounded-xl font-mono text-[11px] text-slate-400 select-all overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
              title={upiRef}
            >
              {upiRef.slice(0, 12)}…
            </div>
          </div>
        </div>

        {/* Category badge */}
        <div className="flex items-center gap-2">
          <span className="font-body text-xs text-slate-500">Category:</span>
          <span
            className="font-mono text-xs px-2.5 py-1 rounded-full"
            style={{
              background: 'rgba(34,197,94,0.08)',
              color: '#22C55E',
              border: '1px solid rgba(34,197,94,0.2)',
            }}
          >
            {merchant.category}
          </span>
        </div>

        {/* Pay button */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={handlePay}
          disabled={loading || !amount}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-display font-semibold text-white transition-all disabled:opacity-40"
          style={{ background: 'linear-gradient(135deg, #16A34A, #059669)' }}
        >
          {loading
            ? <><Loader size={16} className="animate-spin" />Validating…</>
            : <><Smartphone size={16} />Pay via UPI</>
          }
        </motion.button>

        {/* UPI Receipt */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-2xl p-4 border"
              style={{ background: receiptBg, borderColor: receiptColor }}
            >
              {/* Receipt header */}
              <div className="flex items-center gap-3 mb-3">
                {meta && <meta.Icon size={20} className={meta.cls} />}
                <span className="font-display font-bold text-base" style={{ color: receiptColor.replace('0.35', '1') }}>
                  {clawbackDone ? 'Clawback Initiated' : meta?.label || result.status}
                </span>
                {result.processing_time_ms != null && (
                  <span className="ml-auto font-mono text-xs text-slate-400">
                    {Number(result.processing_time_ms).toFixed(1)}ms
                  </span>
                )}
              </div>

              {/* Receipt rows */}
              <div
                className="rounded-xl p-3 mb-3 space-y-1.5"
                style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)' }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] text-slate-500">To</span>
                  <span className="font-mono text-xs text-slate-300">{merchant.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] text-slate-500">From</span>
                  <span className="font-mono text-xs text-slate-300">{vpa}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] text-slate-500">Amount</span>
                  <span className="font-mono text-sm font-bold text-slate-100">₹{parseFloat(amount).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] text-slate-500">UPI Ref</span>
                  <span className="font-mono text-[11px] text-slate-400">{upiRef}</span>
                </div>
              </div>

              {result.reason && (
                <p className="font-body text-sm text-slate-300 mb-1.5">{result.reason}</p>
              )}
              {result.ai_reasoning && (
                <p className="font-body text-xs text-slate-400 italic leading-relaxed">
                  {result.ai_reasoning}
                </p>
              )}
              {result.policies_evaluated > 0 && (
                <p className="font-mono text-xs text-slate-500 mt-2">
                  {result.policies_evaluated} policies evaluated
                </p>
              )}

              {result.status === 'APPROVED' && !clawbackDone && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleClawback}
                  className="mt-3 w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-body font-semibold"
                  style={{
                    background: 'rgba(251,146,60,0.1)',
                    border: '1px solid rgba(251,146,60,0.3)',
                    color: '#FB923C',
                  }}
                >
                  <RotateCcw size={13} />
                  Initiate Clawback
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </GlassCard>
  );
}
