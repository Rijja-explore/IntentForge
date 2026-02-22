/* ─── IntentRules.jsx ───────────────────────────────────────────────
 * Route: /intent
 *
 * Role-based conditional rendering:
 *   Lender (Account 0)   → LenderDashboard
 *   Receiver (Account 1) → ReceiverDashboard
 *   Unknown account      → "Connect the correct wallet" prompt
 *   Not connected        → Connect wallet prompt
 *
 * Contract enforcement is on-chain; the UI just mirrors that reality.
 * ─────────────────────────────────────────────────────────────── */

import { motion, AnimatePresence } from 'framer-motion';
import Header from '../components/layout/Header';
import SharedWalletInfo  from '../components/intent/SharedWalletInfo';
import LenderDashboard   from '../components/intent/LenderDashboard';
import ReceiverDashboard from '../components/intent/ReceiverDashboard';
import Unauthorized      from '../components/intent/Unauthorized';
import { useWeb3 } from '../hooks/useWeb3';
import { Zap, AlertTriangle, ExternalLink } from 'lucide-react';
import { containerVariants } from '../utils/animations';
import { LENDER_ADDRESS, RECEIVER_ADDRESS, INTENT_FORGE_ADDRESS } from '../config/contracts';

function shortenAddr(addr) {
  return addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : '—';
}

/* ── Not-deployed warning ──────────────────────────────────────── */
function ContractNotDeployedBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-4 mb-6 flex items-start gap-3"
      style={{
        background: 'rgba(245,158,11,0.08)',
        border: '1px solid rgba(245,158,11,0.3)',
      }}
    >
      <AlertTriangle size={16} style={{ color: '#F59E0B' }} className="mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-sm font-semibold" style={{ color: '#FCD34D' }}>Contract not deployed yet</p>
        <p className="text-xs text-slate-400 mt-0.5">
          Run the deploy script to connect the frontend to the local Hardhat chain:
        </p>
        <code className="block mt-2 text-[11px] font-mono text-slate-300 bg-black/30 rounded-lg px-3 py-1.5">
          npx hardhat run scripts/deploy-intent.js --network localhost
        </code>
      </div>
    </motion.div>
  );
}

/* ── Connect wallet prompt ─────────────────────────────────────── */
function ConnectPrompt({ onConnect, connecting }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-2xl p-10 text-center"
      style={{
        background: 'linear-gradient(135deg, rgba(14,19,42,0.9) 0%, rgba(10,15,40,0.9) 100%)',
        border: '1px solid rgba(167,139,250,0.2)',
      }}
    >
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
        style={{
          background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(249,115,22,0.15))',
          border: '1px solid rgba(167,139,250,0.3)',
        }}
      >
        <Zap size={28} style={{ color: '#A78BFA' }} />
      </div>

      <h3 className="font-display font-bold text-xl text-slate-100 mb-2">
        Role-Based Fund Rules
      </h3>
      <p className="text-sm text-slate-400 mb-8 max-w-sm mx-auto">
        Connect MetaMask with Account 0 (Lender) or Account 1 (Receiver)
        to interact with the restricted fund contract.
      </p>

      <motion.button
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        onClick={onConnect}
        disabled={connecting}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold"
        style={{
          background: 'linear-gradient(135deg, #7C3AED, #5B21B6)',
          color: 'white',
          border: '1px solid rgba(167,139,250,0.3)',
          opacity: connecting ? 0.7 : 1,
          cursor: connecting ? 'not-allowed' : 'pointer',
        }}
      >
        <ExternalLink size={15} />
        {connecting ? 'Connecting…' : 'Connect MetaMask'}
      </motion.button>

      <div className="mt-8 grid sm:grid-cols-2 gap-3 text-left">
        {[
          { label: 'Account 0 — Lender',   desc: 'Create rules, lock ETH',  addr: LENDER_ADDRESS,   color: '#A78BFA' },
          { label: 'Account 1 — Receiver',  desc: 'View & claim funds',      addr: RECEIVER_ADDRESS, color: '#34D399' },
        ].map(({ label, desc, addr, color }) => (
          <div
            key={addr}
            className="p-3 rounded-xl"
            style={{ background: `${color}10`, border: `1px solid ${color}20` }}
          >
            <p className="text-xs font-semibold" style={{ color }}>{label}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">{desc}</p>
            <p className="font-mono text-[11px] text-slate-600 mt-1">{shortenAddr(addr)}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

/* ── Main Page ─────────────────────────────────────────────────── */
export default function IntentRules({ sidebarOpen, onMenuOpen }) {
  const {
    account, role, isLender, isReceiver,
    ethBalance, lockedBalance, connecting, error,
    isContractDeployed, connect, refreshBalances,
  } = useWeb3();

  return (
    <div className="relative min-h-screen">
      <Header title="Fund Rules" sidebarOpen={sidebarOpen} onMenuOpen={onMenuOpen} />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 p-4 md:p-6 space-y-6 pb-24 md:pb-6"
      >
        {/* Contract not deployed warning */}
        {!isContractDeployed && <ContractNotDeployedBanner />}

        {/* Error banner */}
        {error && (
          <div
            className="flex items-start gap-2 p-3 rounded-xl mb-2"
            style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)' }}
          >
            <AlertTriangle size={14} style={{ color: '#F87171' }} className="mt-0.5" />
            <span className="text-xs font-mono" style={{ color: '#F87171' }}>{error}</span>
          </div>
        )}

        {/* Contract address chip */}
        {isContractDeployed && (
          <div className="flex items-center gap-2">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono"
              style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)', color: '#34D399' }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Contract: {shortenAddr(INTENT_FORGE_ADDRESS)}
            </div>
          </div>
        )}

        {/* Wallet info strip (always visible when possible) */}
        {account && (
          <SharedWalletInfo
            account={account}
            role={role}
            ethBalance={ethBalance}
            lockedBalance={lockedBalance}
            connecting={connecting}
            onConnect={connect}
          />
        )}

        {/* Role-based dashboard */}
        <AnimatePresence mode="wait">
          {!account ? (
            <ConnectPrompt key="connect" onConnect={connect} connecting={connecting} />
          ) : isLender ? (
            <motion.div key="lender" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <LenderDashboard account={account} onBalanceRefresh={refreshBalances} />
            </motion.div>
          ) : isReceiver ? (
            <motion.div key="receiver" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ReceiverDashboard account={account} onBalanceRefresh={refreshBalances} />
            </motion.div>
          ) : (
            <motion.div key="unknown" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Unauthorized account={account} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
