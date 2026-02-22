/* ─── Unauthorized.jsx ───────────────────────────────────────────────
 * Shown when a connected wallet is neither the Lender nor Receiver.
 *
 * Props:
 *   account    – current MetaMask address (string, already lowercase)
 *   onDisconnect – optional callback to reset state (local only)
 * ─────────────────────────────────────────────────────────────── */

import { motion } from 'framer-motion';
import { ShieldOff, RefreshCw } from 'lucide-react';
import { LENDER_ADDRESS, RECEIVER_ADDRESS } from '../../config/contracts';

function shortenAddr(addr) {
  return addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : '—';
}

export default function Unauthorized({ account, onDisconnect }) {
  return (
    <div className="relative z-20 min-h-screen flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 120, damping: 18 }}
        className="w-full max-w-md rounded-3xl p-8 text-center"
        style={{
          background: 'linear-gradient(135deg, rgba(14,19,42,0.97) 0%, rgba(10,15,40,0.97) 100%)',
          border: '1px solid rgba(248,113,113,0.25)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        {/* Icon */}
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
          style={{
            background: 'rgba(248,113,113,0.1)',
            border: '1px solid rgba(248,113,113,0.25)',
          }}
        >
          <ShieldOff size={30} style={{ color: '#F87171' }} />
        </div>

        {/* Title */}
        <h2 className="font-display font-bold text-xl text-slate-100 mb-2">
          Account not authorised
        </h2>

        {/* Connected address */}
        <p className="text-sm text-slate-400 mb-2">
          Connected:{' '}
          <span className="font-mono text-slate-300">{shortenAddr(account)}</span>
        </p>
        <p className="text-xs text-slate-500 mb-6 max-w-xs mx-auto">
          This DApp is role-restricted. Only the two Hardhat accounts below
          are authorised to use the platform.
        </p>

        {/* Allowed accounts */}
        <div className="grid sm:grid-cols-2 gap-3 text-left mb-7">
          {[
            {
              label: 'Account 0 — Lender',
              addr:  LENDER_ADDRESS,
              color: '#A78BFA',
              desc:  'Create rules & lock ETH',
            },
            {
              label: 'Account 1 — Receiver',
              addr:  RECEIVER_ADDRESS,
              color: '#34D399',
              desc:  'View & claim funds',
            },
          ].map(({ label, addr, color, desc }) => (
            <div
              key={addr}
              className="p-3 rounded-2xl"
              style={{
                background: `${color}08`,
                border: `1px solid ${color}20`,
              }}
            >
              <p className="text-xs font-display font-semibold mb-0.5" style={{ color }}>
                {label}
              </p>
              <p className="text-[11px] text-slate-500 mb-1">{desc}</p>
              <p className="font-mono text-[11px] text-slate-500 break-all">{addr}</p>
            </div>
          ))}
        </div>

        {/* Instruction */}
        <p className="text-xs text-slate-600 mb-5">
          Switch to one of the accounts above in MetaMask — the app will
          detect the change automatically.
        </p>

        {/* Optional disconnect (clears local state) */}
        {onDisconnect && (
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={onDisconnect}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold"
            style={{
              background: 'rgba(248,113,113,0.1)',
              border: '1px solid rgba(248,113,113,0.2)',
              color: '#F87171',
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={13} />
            Disconnect &amp; go back
          </motion.button>
        )}
      </motion.div>
    </div>
  );
}
