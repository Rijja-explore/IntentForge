/* ─── Settings.jsx ───────────────────────────────────────────────────
 * Role-aware settings page.
 * Lender and Receiver see entirely different setting groups and
 * profile information drawn from the live wallet connection.
 * ─────────────────────────────────────────────────────────────── */

import { motion } from 'framer-motion';
import { useState } from 'react';
import Header        from '../components/layout/Header';
import GlassCard     from '../components/shared/GlassCard';
import AnimatedButton from '../components/shared/AnimatedButton';
import { containerVariants, cardVariants } from '../utils/animations';
import { Shield, Bell, Lock, Zap, Inbox, AlertTriangle } from 'lucide-react';
import { useWeb3 } from '../hooks/useWeb3';

// ── Toggle component ────────────────────────────────────────────────
function ToggleSwitch({ value, onChange }) {
  return (
    <motion.button
      whileTap={{ scale: 0.85 }}
      onClick={() => onChange(!value)}
      className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
        value ? 'bg-trust-electric' : 'bg-slate-700'
      }`}
    >
      <motion.div
        animate={{ x: value ? 24 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-md"
      />
    </motion.button>
  );
}

// ── Role-specific settings config ───────────────────────────────────
function buildGroups(role) {
  const security = {
    title: 'Security',
    icon: Shield,
    hex: '#7C3AED',
    items: [
      { label: 'Two-Factor Authentication', description: 'Add an extra layer of account security', value: true  },
      { label: 'Transaction PIN',           description: 'Require PIN for on-chain transactions',  value: true  },
    ],
  };

  const privacy = {
    title: 'Privacy',
    icon: Lock,
    hex: '#059669',
    items: [
      { label: 'Anonymous Mode', description: 'Hide wallet address in the UI', value: false },
    ],
  };

  if (role === 'lender') {
    return [
      security,
      {
        title: 'Rule Notifications',
        icon: Bell,
        hex: '#F97316',
        items: [
          { label: 'Claim Alerts',        description: 'Notify when receiver claims locked ETH',   value: true  },
          { label: 'Expiry Alerts',        description: 'Remind before a rule expires unclaimed',   value: true  },
          { label: 'AI Rule Suggestions',  description: 'Weekly AI-powered rule optimisation tips', value: false },
        ],
      },
      {
        title: 'Analytics',
        icon: Zap,
        hex: '#A78BFA',
        items: [
          { label: 'On-chain Analytics', description: 'Track rule performance and claim rates', value: true  },
          { label: 'Data Contribution',  description: 'Help improve AI compliance models',     value: false },
        ],
      },
      privacy,
    ];
  }

  // receiver
  return [
    security,
    {
      title: 'Claim Notifications',
      icon: Inbox,
      hex: '#34D399',
      items: [
        { label: 'New Rule Alerts',  description: 'Notify when lender creates a rule for you', value: true },
        { label: 'Expiry Reminders', description: 'Alert before a claimable rule expires',     value: true },
        { label: 'Claim Confirmed',  description: 'Confirmation after successful ETH claim',   value: true },
      ],
    },
    privacy,
  ];
}

const ROLE_CFG = {
  lender:   { label: 'LENDER',   color: '#A78BFA', bg: 'rgba(167,139,250,0.12)', border: 'rgba(167,139,250,0.3)' },
  receiver: { label: 'RECEIVER', color: '#34D399', bg: 'rgba(52,211,153,0.12)',  border: 'rgba(52,211,153,0.3)'  },
};

function shortenAddr(addr) {
  return addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : '—';
}

// ── Main component ───────────────────────────────────────────────────
export default function Settings({ sidebarOpen, onMenuOpen }) {
  const { account, role, ethBalance } = useWeb3();
  const roleCfg = ROLE_CFG[role] ?? ROLE_CFG.lender;
  const groups  = buildGroups(role);

  const [settings, setSettings] = useState(() =>
    groups.reduce((acc, group) => {
      group.items.forEach((item) => { acc[item.label] = item.value; });
      return acc;
    }, {})
  );

  const toggle = (label) =>
    setSettings((prev) => ({ ...prev, [label]: !prev[label] }));

  return (
    <div>
      <Header title="Settings" sidebarOpen={sidebarOpen} onMenuOpen={onMenuOpen} />

      <div className="p-4 md:p-6 space-y-6 pb-24 md:pb-6">

        {/* ── Profile card — live wallet data ──────────────────────── */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <GlassCard>
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-white flex-shrink-0"
                style={{
                  background: `linear-gradient(135deg, ${roleCfg.color}50, ${roleCfg.color}90)`,
                  border: `1px solid ${roleCfg.border}`,
                  boxShadow: `0 4px 16px ${roleCfg.color}30`,
                }}
              >
                {role === 'lender' ? <Zap size={24} /> : <Inbox size={24} />}
              </div>

              <div className="flex-1 min-w-0">
                <div
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold mb-1"
                  style={{ background: roleCfg.bg, border: `1px solid ${roleCfg.border}`, color: roleCfg.color }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: roleCfg.color }} />
                  {roleCfg.label}
                </div>

                <p className="font-mono text-sm text-slate-200 truncate" title={account ?? ''}>
                  {account ?? '—'}
                </p>

                <div className="flex items-center gap-3 mt-1">
                  <p className="font-mono text-xs font-bold" style={{ color: '#FB923C' }}>
                    {ethBalance} ETH
                  </p>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-success-emerald" />
                    <span className="text-[11px] text-success-emerald">Connected</span>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* ── Role description banner ───────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex items-start gap-3 p-3.5 rounded-2xl"
          style={{ background: `${roleCfg.color}08`, border: `1px solid ${roleCfg.color}20` }}
        >
          {role === 'lender'
            ? <Zap size={15} style={{ color: roleCfg.color }} className="mt-0.5 flex-shrink-0" />
            : <Inbox size={15} style={{ color: roleCfg.color }} className="mt-0.5 flex-shrink-0" />}
          <div>
            <p className="text-xs font-display font-semibold" style={{ color: roleCfg.color }}>
              {role === 'lender' ? 'Lender permissions' : 'Receiver permissions'}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {role === 'lender'
                ? 'Create rules, lock ETH with expiry conditions, and monitor all claim activity.'
                : 'View rules addressed to you and claim eligible funds. Rule creation is restricted to the Lender and enforced on-chain.'}
            </p>
          </div>
        </motion.div>

        {/* ── Settings groups ───────────────────────────────────────── */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {groups.map((group) => (
            <motion.div key={group.title} variants={cardVariants}>
              <GlassCard hover={false}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-xl" style={{ background: `${group.hex}15` }}>
                    <group.icon size={18} style={{ color: group.hex }} />
                  </div>
                  <h3 className="font-display font-semibold text-lg text-slate-100">{group.title}</h3>
                </div>
                <div className="space-y-4">
                  {group.items.map((item) => (
                    <div key={item.label} className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-body font-medium text-sm text-slate-100">{item.label}</p>
                        <p className="font-body text-xs text-slate-400 mt-0.5">{item.description}</p>
                      </div>
                      <ToggleSwitch
                        value={settings[item.label] ?? item.value}
                        onChange={() => toggle(item.label)}
                      />
                    </div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Danger zone ───────────────────────────────────────────── */}
        <GlassCard hover={false} className="border-danger-crimson/20">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={16} style={{ color: '#F87171' }} />
            <h3 className="font-display font-semibold text-lg text-danger-crimson">Danger Zone</h3>
          </div>
          <div className="space-y-3">
            {role === 'lender' && (
              <AnimatedButton variant="danger" className="w-full justify-start">
                Reset All Rules
              </AnimatedButton>
            )}
            <AnimatedButton variant="danger" className="w-full justify-start">
              Clear Transaction History
            </AnimatedButton>
          </div>
        </GlassCard>

        {/* ── App info ──────────────────────────────────────────────── */}
        <div className="text-center py-4">
          <p className="font-mono text-xs text-slate-500">IntentForge v1.0.0</p>
          <p className="font-body text-xs text-slate-600 mt-1">
            Chain 31337 · Hardhat Local · {shortenAddr(account)}
          </p>
        </div>
      </div>
    </div>
  );
}
