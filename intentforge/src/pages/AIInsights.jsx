import { motion } from 'framer-motion';
import Header from '../components/layout/Header';
import GlassCard from '../components/shared/GlassCard';
import InsightsPanel from '../components/ai/InsightsPanel';
import VoiceInput from '../components/ai/VoiceInput';
import { containerVariants, cardVariants } from '../utils/animations';
import { Brain, TrendingDown, ShieldAlert, Lightbulb } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const spendingTrend = [
  { week: 'W1', amount: 12400, saved: 3200 },
  { week: 'W2', amount: 18700, saved: 5100 },
  { week: 'W3', amount: 9800, saved: 8400 },
  { week: 'W4', amount: 14200, saved: 6800 },
  { week: 'W5', amount: 11000, saved: 9200 },
];

export default function AIInsights() {
  const handleVoiceCommand = (transcript) => {
    console.log('Voice command:', transcript);
  };

  return (
    <div>
      <Header title="AI Insights" />
      <div className="p-4 md:p-6 space-y-6 pb-24 md:pb-6">

        {/* AI Hero */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-gradient-primary rounded-3xl p-8"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-money-gold/10 rounded-full blur-3xl" />
          <div className="relative z-10 flex items-center gap-4">
            <motion.div
              animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
              className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center"
            >
              <Brain size={32} className="text-white" />
            </motion.div>
            <div>
              <h2 className="font-display font-bold text-2xl text-white">AI Financial Brain</h2>
              <p className="font-body text-white/70 mt-1">
                Analyzed 847 transactions • 12 patterns detected • 3 recommendations ready
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          {[
            { label: 'Predicted Savings', value: '₹12,400', icon: TrendingDown, hex: '#059669' },
            { label: 'Risk Alerts', value: '2 Active', icon: ShieldAlert, hex: '#DC2626' },
            { label: 'Insights Today', value: '7 New', icon: Lightbulb, hex: '#F97316' },
          ].map((stat) => (
            <motion.div key={stat.label} variants={cardVariants}>
              <GlassCard style={{ borderColor: `${stat.hex}30` }}>
                <div className="p-2 rounded-xl w-fit mb-3" style={{ background: `${stat.hex}15` }}>
                  <stat.icon size={20} style={{ color: stat.hex }} />
                </div>
                <p className="font-mono font-bold text-2xl" style={{ color: stat.hex }}>{stat.value}</p>
                <p className="font-body text-sm text-slate-400 mt-1">{stat.label}</p>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Spending trend */}
          <GlassCard hover={false}>
            <h3 className="font-display font-semibold text-lg text-violet-950 mb-4">Spending vs Savings Trend</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={spendingTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(124,58,237,0.08)" />
                <XAxis dataKey="week" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#FFFFFF', border: '1px solid rgba(168,85,247,0.2)', borderRadius: '12px' }}
                  labelStyle={{ color: '#1E0A3C' }}
                  formatter={(v) => `₹${v.toLocaleString('en-IN')}`}
                />
                <Line type="monotone" dataKey="amount" stroke="#FF6B00" strokeWidth={2} dot={{ fill: '#FF6B00' }} name="Spending" />
                <Line type="monotone" dataKey="saved" stroke="#10B981" strokeWidth={2} dot={{ fill: '#10B981' }} name="Saved" />
              </LineChart>
            </ResponsiveContainer>
          </GlassCard>

          {/* Voice Commands */}
          <GlassCard hover={false}>
            <h3 className="font-display font-semibold text-lg text-violet-950 mb-6">Voice Commands</h3>
            <VoiceInput onResult={handleVoiceCommand} />
            <div className="mt-6 space-y-2">
              <p className="font-body text-xs text-slate-400 font-semibold uppercase tracking-wider">Try saying:</p>
              {[
                '"Lock 5000 rupees for groceries"',
                '"Block all gambling sites"',
                '"Show me my spending this week"',
              ].map((cmd) => (
                <p key={cmd} className="font-mono text-xs text-trust-electric bg-trust-electric/5 px-3 py-2 rounded-lg">{cmd}</p>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* AI Suggestions */}
        <GlassCard hover={false}>
          <InsightsPanel />
        </GlassCard>
      </div>
    </div>
  );
}
