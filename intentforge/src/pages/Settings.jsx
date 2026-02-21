import { motion } from 'framer-motion';
import { useState } from 'react';
import Header from '../components/layout/Header';
import GlassCard from '../components/shared/GlassCard';
import AnimatedButton from '../components/shared/AnimatedButton';
import { containerVariants, cardVariants } from '../utils/animations';
import { Shield, Bell, Lock } from 'lucide-react';

const settingsGroups = [
  {
    title: 'Security',
    icon: Shield,
    hex: '#7C3AED',
    items: [
      { label: 'Two-Factor Authentication', description: 'Add an extra layer of security', value: true },
      { label: 'Biometric Login', description: 'Use fingerprint or face ID', value: false },
      { label: 'Transaction PIN', description: 'Require PIN for large transactions', value: true },
    ],
  },
  {
    title: 'Notifications',
    icon: Bell,
    hex: '#F97316',
    items: [
      { label: 'Transaction Alerts', description: 'Get notified for every transaction', value: true },
      { label: 'Rule Triggers', description: 'Alerts when a rule is activated', value: true },
      { label: 'AI Recommendations', description: 'Weekly spending insights', value: false },
    ],
  },
  {
    title: 'Privacy',
    icon: Lock,
    hex: '#059669',
    items: [
      { label: 'Data Analytics', description: 'Help improve AI recommendations', value: true },
      { label: 'Anonymous Mode', description: 'Hide personal details in UI', value: false },
    ],
  },
];

function ToggleSwitch({ value, onChange }) {
  return (
    <motion.button
      whileTap={{ scale: 0.85 }}
      onClick={() => onChange(!value)}
      className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${value ? 'bg-trust-electric' : 'bg-violet-100'}`}
    >
      <motion.div
        animate={{ x: value ? 24 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-md"
      />
    </motion.button>
  );
}

export default function Settings({ sidebarOpen, onMenuOpen }) {
  const [settings, setSettings] = useState(
    settingsGroups.reduce((acc, group) => {
      group.items.forEach(item => { acc[item.label] = item.value; });
      return acc;
    }, {})
  );

  const toggle = (label) => setSettings(prev => ({ ...prev, [label]: !prev[label] }));

  return (
    <div>
      <Header title="Settings" sidebarOpen={sidebarOpen} onMenuOpen={onMenuOpen} />
      <div className="p-4 md:p-6 space-y-6 pb-24 md:pb-6">

        {/* Profile card */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <GlassCard className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center text-2xl font-bold text-white">
              P
            </div>
            <div>
              <h3 className="font-display font-bold text-xl text-slate-100">Prasad K.</h3>
              <p className="font-body text-sm text-slate-400">prasad@intentforge.in</p>
              <div className="flex items-center gap-1.5 mt-1">
                <div className="w-2 h-2 rounded-full bg-success-emerald" />
                <span className="text-xs font-body text-success-emerald">Verified Account</span>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Settings groups */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {settingsGroups.map((group) => (
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
                      <ToggleSwitch value={settings[item.label]} onChange={() => toggle(item.label)} />
                    </div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>

        {/* Danger zone */}
        <GlassCard hover={false} className="border-danger-crimson/20">
          <h3 className="font-display font-semibold text-lg text-danger-crimson mb-4">Danger Zone</h3>
          <div className="space-y-3">
            <AnimatedButton variant="danger" className="w-full justify-start">
              Reset All Rules
            </AnimatedButton>
            <AnimatedButton variant="danger" className="w-full justify-start">
              Clear Transaction History
            </AnimatedButton>
          </div>
        </GlassCard>

        {/* App info */}
        <div className="text-center py-4">
          <p className="font-mono text-xs text-slate-400">IntentForge v1.0.0</p>
          <p className="font-body text-xs text-slate-400 mt-1">NXTGEN Hackathon 2025 • Programmable Digital Rupee</p>
        </div>
      </div>
    </div>
  );
}
