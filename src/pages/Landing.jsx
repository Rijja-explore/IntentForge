/* ─── Landing.jsx ────────────────────────────────────────────────────
 * Hero landing screen shown when no wallet is connected.
 * Fits in a single viewport — no scroll.
 *
 * Props:
 *   onConnect  – callback to trigger MetaMask connection
 *   connecting – boolean, true while awaiting MetaMask response
 *   error      – error string or null
 * ─────────────────────────────────────────────────────────────── */

import { useMemo, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, ShieldCheck, Activity, Brain,
  ExternalLink, Lock, TrendingUp, Cpu, Circle,
} from 'lucide-react';
import { RPC_URL } from '../config/contracts';

// ── Hardhat node status probe ───────────────────────────────────────
function useNodeStatus() {
  const [status, setStatus] = useState('checking');
  useEffect(() => {
    let cancelled = false;
    async function probe() {
      try {
        const res = await fetch(RPC_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jsonrpc: '2.0', method: 'net_version', params: [], id: 1 }),
          signal: AbortSignal.timeout(2500),
        });
        if (!cancelled) setStatus(res.ok ? 'online' : 'offline');
      } catch {
        if (!cancelled) setStatus('offline');
      }
    }
    probe();
    const id = setInterval(probe, 8000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);
  return status;
}

// ── Deterministic-random helpers (stable across renders) ────────────
function seededRand(seed) {
  let s = seed;
  return () => { s = (s * 16807 + 0) % 2147483647; return (s - 1) / 2147483646; };
}

// ── Particle layer ───────────────────────────────────────────────────
const PARTICLE_COLORS = [
  'rgba(167,139,250,0.7)',   // violet
  'rgba(167,139,250,0.4)',
  'rgba(249,115,22,0.6)',    // orange
  'rgba(249,115,22,0.35)',
  'rgba(52,211,153,0.5)',    // emerald
  'rgba(52,211,153,0.3)',
  'rgba(96,165,250,0.5)',    // blue
  'rgba(255,255,255,0.25)',  // white shimmer
];

function FloatingParticles() {
  const particles = useMemo(() => {
    const rand = seededRand(42);
    return Array.from({ length: 55 }, (_, i) => {
      return {
        id:      i,
        x:       rand() * 100,           // % from left
        y:       rand() * 100,           // % from top
        size:    1.5 + rand() * 4.5,     // 1.5 – 6 px
        color:   PARTICLE_COLORS[Math.floor(rand() * PARTICLE_COLORS.length)],
        dur:     6  + rand() * 18,       // 6 – 24 s
        delay:   rand() * -20,           // negative = already mid-animation
        dx:      (rand() - 0.5) * 160,   // drift range px
        dy:      (rand() - 0.5) * 160,
        opacity: 0.3 + rand() * 0.7,
        blur:    rand() > 0.65,          // ~35% get a soft glow blur
      };
    });
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 1 }}>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          style={{
            position:     'absolute',
            left:         `${p.x}%`,
            top:          `${p.y}%`,
            width:        p.size,
            height:       p.size,
            borderRadius: '50%',
            background:   p.color,
            filter:       p.blur ? `blur(1px) drop-shadow(0 0 ${p.size * 1.5}px ${p.color})` : 'none',
            opacity:      p.opacity,
          }}
          animate={{
            x:       [0, p.dx * 0.4, p.dx * -0.3, p.dx * 0.7, 0],
            y:       [0, p.dy * -0.5, p.dy * 0.6, p.dy * -0.2, 0],
            opacity: [p.opacity, p.opacity * 0.4, p.opacity, p.opacity * 0.6, p.opacity],
            scale:   [1, 1.4, 0.7, 1.2, 1],
          }}
          transition={{
            duration: p.dur,
            delay:    p.delay,
            repeat:   Infinity,
            ease:     'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

// ── Feature card data ────────────────────────────────────────────────
const FEATURES = [
  { icon: ShieldCheck, color: '#A78BFA', bg: 'rgba(124,58,237,0.12)', border: 'rgba(167,139,250,0.22)', title: 'Govern',   desc: 'Rule-based policies enforced on-chain — immutable once set.' },
  { icon: Activity,   color: '#34D399', bg: 'rgba(52,211,153,0.10)', border: 'rgba(52,211,153,0.22)',  title: 'Track',    desc: 'Real-time audit log of every intent, claim, and violation.' },
  { icon: Lock,       color: '#FB923C', bg: 'rgba(249,115,22,0.10)', border: 'rgba(249,115,22,0.22)',  title: 'Enforce',  desc: 'Funds locked until conditions are met. Zero override.' },
  { icon: Brain,      color: '#60A5FA', bg: 'rgba(96,165,250,0.10)', border: 'rgba(96,165,250,0.22)',  title: 'Automate', desc: 'AI intent parsing turns plain English into on-chain rules.' },
];

const STATS = [
  { label: 'Chain ID', value: '31337',   icon: Cpu,        color: '#A78BFA' },
  { label: 'Network',  value: 'Hardhat', icon: Circle,     color: '#34D399' },
  { label: 'Protocol', value: 'EVM',     icon: TrendingUp, color: '#FB923C' },
];

// ── Node badge ────────────────────────────────────────────────────────
function NodeBadge({ status }) {
  const cfg = {
    online:   { color: '#34D399', label: 'Node online'  },
    offline:  { color: '#F87171', label: 'Node offline' },
    checking: { color: '#FCD34D', label: 'Checking…'   },
  }[status];
  return (
    <div
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono"
      style={{ background: `${cfg.color}12`, border: `1px solid ${cfg.color}30`, color: cfg.color }}
    >
      <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: cfg.color }} />
      {cfg.label}
    </div>
  );
}

// ── Main Landing Component ────────────────────────────────────────────
export default function Landing({ onConnect, connecting = false, error = null }) {
  const nodeStatus = useNodeStatus();

  return (
    <div
      className="relative flex flex-col overflow-hidden"
      style={{ height: '100vh', maxHeight: '100vh' }}
    >
      {/* Particle layer */}
      <FloatingParticles />

      {/* ── Top bar ─────────────────────────────────────────────── */}
      <motion.header
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative z-20 flex items-center justify-between px-6 py-3 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(167,139,250,0.08)' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #3B0764 0%, #7C3AED 55%, #F97316 100%)',
              boxShadow: '0 4px 16px rgba(124,58,237,0.4)',
            }}
          >
            <Zap size={16} className="text-white" style={{ filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.5))' }} />
          </div>
          <div>
            <span className="font-display font-bold text-sm text-slate-100 leading-none">IntentForge</span>
            <p
              className="text-[9px] font-medium mt-0.5 leading-none"
              style={{
                background: 'linear-gradient(135deg, #A78BFA, #FB923C)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Digital Rupee Platform
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <NodeBadge status={nodeStatus} />
          <div
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono"
            style={{ background: 'rgba(14,19,42,0.8)', border: '1px solid rgba(167,139,250,0.12)', color: '#475569' }}
          >
            localhost:8545
          </div>
        </div>
      </motion.header>

      {/* ── Hero (centre content) ────────────────────────────────── */}
      <main className="relative z-10 flex flex-col items-center justify-center flex-1 px-6 text-center min-h-0">

        {/* Chain badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.82 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.12, duration: 0.35, ease: 'backOut' }}
          className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-[11px] font-mono font-semibold mb-4"
          style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(167,139,250,0.28)', color: '#A78BFA' }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
          Web3 · Hardhat Local · Chain 31337
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.45 }}
          className="font-display font-bold leading-none tracking-tight mb-3"
          style={{ fontSize: 'clamp(2.8rem, 7vw, 5.5rem)', color: '#F1F5F9' }}
        >
          Intent
          <span
            style={{
              background: 'linear-gradient(135deg, #A78BFA 0%, #7C3AED 45%, #FB923C 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Forge
          </span>
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.45 }}
          className="text-slate-400 max-w-md mb-7 leading-relaxed"
          style={{ fontSize: 'clamp(0.85rem, 1.8vw, 1.05rem)' }}
        >
          Rule‑based restricted fund management enforced by smart contracts.{' '}
          <span className="text-slate-500">Govern · Track · Enforce — on‑chain.</span>
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38, duration: 0.4 }}
          className="flex flex-col items-center gap-3"
        >
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 0 36px rgba(124,58,237,0.55)' }}
            whileTap={{ scale: 0.95 }}
            onClick={onConnect}
            disabled={connecting}
            className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-2xl font-display font-bold text-base text-white"
            style={{
              background: connecting
                ? 'linear-gradient(135deg, #5B21B6, #4C1D95)'
                : 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 55%, #F97316 160%)',
              border: '1px solid rgba(167,139,250,0.35)',
              boxShadow: '0 4px 28px rgba(124,58,237,0.38)',
              cursor: connecting ? 'wait' : 'pointer',
              opacity: connecting ? 0.8 : 1,
              transition: 'box-shadow 0.2s',
            }}
          >
            <ExternalLink size={17} />
            {connecting ? 'Waiting for MetaMask…' : 'Connect Wallet'}
          </motion.button>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="text-xs font-mono px-3 py-1.5 rounded-lg"
                style={{ color: '#F87171', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)' }}
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Stats strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.52 }}
          className="flex items-center gap-6 mt-6 flex-wrap justify-center"
        >
          {STATS.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="flex items-center gap-1.5">
              <Icon size={12} style={{ color }} />
              <span className="font-mono text-[11px] font-semibold" style={{ color }}>{value}</span>
              <span className="text-[11px] text-slate-600">{label}</span>
            </div>
          ))}
        </motion.div>
      </main>

      {/* ── Feature cards (bottom strip) ────────────────────────── */}
      <section className="relative z-10 px-4 pb-4 flex-shrink-0">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 max-w-5xl mx-auto">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.08, type: 'spring', stiffness: 110, damping: 18 }}
                whileHover={{ y: -3, scale: 1.02 }}
                className="flex items-start gap-3 p-3.5 rounded-2xl"
                style={{
                  background: 'rgba(8,12,30,0.72)',
                  border: `1px solid ${f.border}`,
                  backdropFilter: 'blur(14px)',
                  WebkitBackdropFilter: 'blur(14px)',
                }}
              >
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: f.bg, border: `1px solid ${f.border}` }}
                >
                  <Icon size={15} style={{ color: f.color }} />
                </div>
                <div className="min-w-0">
                  <p className="font-display font-bold text-sm text-slate-100">{f.title}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
