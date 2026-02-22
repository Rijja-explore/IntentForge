/* ─── Auto-Protect Toggle ─────────────────────────────────────────────
 * Shows an ON/OFF toggle. When enabled, polls every 30s for BLOCKED /
 * VIOLATION transactions and automatically calls executeClawback on each.
 * Displays a live "X secured" counter and a scan status indicator.
 * ─────────────────────────────────────────────────────────────── */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ShieldCheck, ShieldOff, RotateCcw, Loader } from 'lucide-react';
import { autoClawback } from '../../services/transactionService';

const POLL_INTERVAL_MS = 30_000; // 30 seconds

export default function AutoProtectToggle({ walletId }) {
  const [enabled,   setEnabled]   = useState(false);
  const [scanning,  setScanning]  = useState(false);
  const [secured,   setSecured]   = useState(0);
  const [lastScan,  setLastScan]  = useState(null);
  const intervalRef = useRef(null);

  const runScan = useCallback(async () => {
    if (!walletId) return;
    setScanning(true);
    try {
      const { secured: count } = await autoClawback(walletId);
      if (count > 0) setSecured(prev => prev + count);
    } finally {
      setScanning(false);
      setLastScan(new Date());
    }
  }, [walletId]);

  useEffect(() => {
    if (enabled) {
      runScan();                                             // immediate scan on enable
      intervalRef.current = setInterval(runScan, POLL_INTERVAL_MS);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [enabled, runScan]);

  const toggle = () => {
    if (enabled) {
      setEnabled(false);
      setScanning(false);
    } else {
      setEnabled(true);
    }
  };

  return (
    <motion.div
      layout
      className="rounded-2xl p-4"
      style={{
        background: enabled
          ? 'rgba(124,58,237,0.07)'
          : 'rgba(255,255,255,0.02)',
        border: `1px solid ${enabled ? 'rgba(167,139,250,0.25)' : 'rgba(255,255,255,0.07)'}`,
        transition: 'background 0.3s, border-color 0.3s',
      }}
    >
      <div className="flex items-center justify-between">
        {/* Left — icon + label */}
        <div className="flex items-center gap-3">
          <motion.div
            animate={enabled ? { scale: [1, 1.15, 1] } : {}}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: enabled ? 'rgba(124,58,237,0.18)' : 'rgba(100,116,139,0.1)',
              border: `1px solid ${enabled ? 'rgba(167,139,250,0.35)' : 'rgba(100,116,139,0.2)'}`,
            }}
          >
            {enabled
              ? <ShieldCheck size={16} style={{ color: '#A78BFA' }} />
              : <ShieldOff  size={16} style={{ color: '#475569' }} />
            }
          </motion.div>

          <div>
            <p className="font-display font-semibold text-sm text-slate-100">Auto-Protect</p>
            <p className="font-body text-xs text-slate-500 mt-0.5">
              {enabled
                ? scanning
                  ? 'Scanning for violations…'
                  : lastScan
                    ? `Last scan ${lastScan.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                    : 'Active — scanning every 30s'
                : 'Auto-clawback on violations'}
            </p>
          </div>
        </div>

        {/* Right — counter + toggle */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Secured counter */}
          <AnimatePresence>
            {enabled && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                style={{
                  background: secured > 0 ? 'rgba(52,211,153,0.1)' : 'rgba(167,139,250,0.08)',
                  border: `1px solid ${secured > 0 ? 'rgba(52,211,153,0.3)' : 'rgba(167,139,250,0.2)'}`,
                }}
              >
                {scanning
                  ? <Loader size={10} style={{ color: '#A78BFA' }} className="animate-spin" />
                  : secured > 0
                    ? <RotateCcw size={10} style={{ color: '#34D399' }} />
                    : <Shield size={10} style={{ color: '#A78BFA' }} />
                }
                <span
                  className="font-mono text-[11px] font-bold"
                  style={{ color: secured > 0 ? '#34D399' : '#A78BFA' }}
                >
                  {secured > 0 ? `${secured} secured` : 'clean'}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Toggle switch */}
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={toggle}
            aria-label={enabled ? 'Disable Auto-Protect' : 'Enable Auto-Protect'}
            className="relative w-11 h-6 rounded-full transition-colors duration-300 flex-shrink-0"
            style={{
              background: enabled
                ? 'linear-gradient(135deg, #7C3AED, #A78BFA)'
                : 'rgba(100,116,139,0.25)',
              border: enabled ? '1px solid rgba(167,139,250,0.5)' : '1px solid rgba(100,116,139,0.3)',
            }}
          >
            <motion.div
              animate={{ x: enabled ? 20 : 2 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="absolute top-0.5 w-5 h-5 rounded-full bg-white"
              style={{ boxShadow: enabled ? '0 0 6px rgba(167,139,250,0.6)' : 'none' }}
            />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
