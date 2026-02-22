/* ─── SharedWalletInfo.jsx ────────────────────────────────────────
 * Displays connected account, role badge, ETH balance, and contract
 * balance.  Shown at the top of both LenderDashboard and ReceiverDashboard.
 * ─────────────────────────────────────────────────────────────── */

import { motion } from 'framer-motion';
import { Wallet, Zap, Lock, LogIn } from 'lucide-react';
import { LENDER_ADDRESS, RECEIVER_ADDRESS } from '../../config/contracts';

const ROLE_CFG = {
  lender:   { label: 'LENDER',   color: '#A78BFA', bg: 'rgba(167,139,250,0.12)', border: 'rgba(167,139,250,0.3)', icon: Zap   },
  receiver: { label: 'RECEIVER', color: '#34D399', bg: 'rgba(52,211,153,0.12)',  border: 'rgba(52,211,153,0.3)',  icon: Wallet },
  unknown:  { label: 'UNKNOWN',  color: '#64748B', bg: 'rgba(100,116,139,0.12)', border: 'rgba(100,116,139,0.3)', icon: Wallet },
};

function shortenAddr(addr) {
  if (!addr) return '—';
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export default function SharedWalletInfo({ account, role, ethBalance, lockedBalance, connecting, onConnect }) {
  const cfg     = ROLE_CFG[role] || ROLE_CFG.unknown;
  const RoleIcon = cfg.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 120, damping: 18 }}
      className="rounded-2xl p-5"
      style={{
        background: 'linear-gradient(135deg, rgba(14,19,42,0.95) 0%, rgba(10,15,40,0.95) 100%)',
        border: '1px solid rgba(167,139,250,0.15)',
        boxShadow: '0 8px 32px rgba(124,58,237,0.12)',
      }}
    >
      <div className="flex flex-wrap items-center gap-4">

        {/* Role badge */}
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
          style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
        >
          <RoleIcon size={14} style={{ color: cfg.color }} />
          <span className="font-mono text-xs font-bold" style={{ color: cfg.color }}>
            {cfg.label}
          </span>
        </div>

        {/* Account address */}
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-full flex-shrink-0"
            style={{
              background: account
                ? `linear-gradient(135deg, ${cfg.color}60, ${cfg.color}20)`
                : 'rgba(100,116,139,0.2)',
              border: `1px solid ${cfg.color}40`,
            }}
          />
          <span className="font-mono text-sm text-slate-300">
            {account ? shortenAddr(account) : 'Not connected'}
          </span>
        </div>

        {/* ETH balance */}
        {account && (
          <div className="flex items-center gap-2">
            <Wallet size={13} className="text-slate-500" />
            <span className="font-mono text-sm text-slate-300">
              {ethBalance} ETH
            </span>
          </div>
        )}

        {/* Locked balance */}
        {account && (
          <div className="flex items-center gap-2">
            <Lock size={13} style={{ color: '#F97316' }} />
            <span className="font-mono text-sm" style={{ color: '#FB923C' }}>
              {lockedBalance} ETH locked
            </span>
          </div>
        )}

        {/* Connect button */}
        {!account && (
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={onConnect}
            disabled={connecting}
            className="ml-auto flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
            style={{
              background: 'linear-gradient(135deg, #7C3AED, #5B21B6)',
              color: 'white',
              border: '1px solid rgba(167,139,250,0.3)',
              opacity: connecting ? 0.6 : 1,
              cursor: connecting ? 'not-allowed' : 'pointer',
            }}
          >
            <LogIn size={14} />
            {connecting ? 'Connecting…' : 'Connect MetaMask'}
          </motion.button>
        )}

        {/* Known addresses reference */}
        <div className="w-full mt-1 flex flex-wrap gap-4 text-[11px] font-mono text-slate-500">
          <span>Lender   → {shortenAddr(LENDER_ADDRESS)}</span>
          <span>Receiver → {shortenAddr(RECEIVER_ADDRESS)}</span>
        </div>
      </div>
    </motion.div>
  );
}
