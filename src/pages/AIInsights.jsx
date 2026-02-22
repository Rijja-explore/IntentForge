import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '../components/layout/Header';
import GlassCard from '../components/shared/GlassCard';
import InsightsPanel from '../components/ai/InsightsPanel';
import VoiceInput from '../components/ai/VoiceInput';
import { containerVariants, cardVariants } from '../utils/animations';
import { Brain, TrendingDown, ShieldAlert, Lightbulb, AlertTriangle, Clock, Zap, Loader, CheckCircle, WifiOff } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from 'recharts';
import { useCompliance } from '../hooks/useCompliance';
import { useWallet } from '../hooks/useWallet';
import { useTransactions } from '../hooks/useTransactions';
import { parseIntent } from '../services/aiService';
import { DEMO_WALLET_STORAGE_KEY } from '../config/api';

const STATIC_SPENDING_TREND = [
  { week: 'W1', amount: 12400, saved: 3200 },
  { week: 'W2', amount: 18700, saved: 5100 },
  { week: 'W3', amount: 9800,  saved: 8400 },
  { week: 'W4', amount: 14200, saved: 6800 },
  { week: 'W5', amount: 11000, saved: 9200 },
];

const STATUS_COLORS = {
  approved: '#34D399', blocked: '#F87171', policy: '#A78BFA', score: '#60A5FA', clawback: '#FB923C',
};

/** Generate a 7-day compliance trend ending at the current score */
function buildComplianceTrend(currentScore) {
  const start = Math.max(60, currentScore - 18);
  const result = [];
  for (let i = 0; i < 7; i++) {
    const progress = i / 6;
    const jitter = (Math.sin(i * 2.5) * 3);
    const score = Math.round(start + (currentScore - start) * progress + jitter);
    result.push({ day: `D${i + 1}`, score: Math.min(100, Math.max(50, score)) });
  }
  return result;
}

/** Build a timeline from real transaction history */
function buildTimeline(transactions) {
  const events = transactions.slice(0, 6).map(t => {
    const approved = (t.status || '').toLowerCase() === 'approved';
    const ts = t.timestamp ? new Date(t.timestamp) : new Date();
    const time = ts.toTimeString().slice(0, 5);
    const merchant = t.merchant ? ` — ${t.merchant}` : '';
    const amt = t.amount ? ` ₹${Number(t.amount).toLocaleString('en-IN')}` : '';
    return {
      time,
      event: `Transaction ${approved ? 'APPROVED' : 'BLOCKED'}${merchant}${amt}`,
      status: approved ? 'approved' : 'blocked',
      icon:   approved ? '✅' : '🚫',
    };
  });

  if (events.length === 0) {
    return [
      { time: '09:14', event: 'Policy deployed: Block Gambling',     status: 'policy',  icon: '🛡️' },
      { time: '10:32', event: 'Transaction APPROVED — Swiggy ₹450', status: 'approved', icon: '✅' },
      { time: '11:05', event: 'Transaction BLOCKED — Dream11',       status: 'blocked',  icon: '🚫' },
      { time: '12:48', event: 'Compliance score updated: 87/100',    status: 'score',    icon: '📈' },
      { time: '14:20', event: 'Clawback initiated — txn #d-2847',    status: 'clawback', icon: '↩️' },
      { time: '16:00', event: 'AI anomaly resolved',                 status: 'approved', icon: '🧠' },
    ];
  }
  return events;
}

function ComplianceTimeline({ events }) {
  return (
    <div className="space-y-3">
      {events.map((ev, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.07 }}
          className="flex items-start gap-3"
        >
          <div className="flex flex-col items-center flex-shrink-0 mt-0.5">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs"
              style={{ background: `${STATUS_COLORS[ev.status]}18`, border: `1px solid ${STATUS_COLORS[ev.status]}40` }}
            >
              {ev.icon}
            </div>
            {i < events.length - 1 && (
              <div className="w-0.5 h-5 mt-1" style={{ background: 'rgba(167,139,250,0.12)' }} />
            )}
          </div>
          <div className="flex-1 min-w-0 pb-1">
            <p className="font-body text-sm text-slate-200 leading-snug">{ev.event}</p>
            <p className="font-mono text-xs text-slate-500 mt-0.5">{ev.time} today</p>
          </div>
          <span
            className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5"
            style={{ background: `${STATUS_COLORS[ev.status]}18`, color: STATUS_COLORS[ev.status], border: `1px solid ${STATUS_COLORS[ev.status]}30` }}
          >
            {ev.status.toUpperCase()}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

/* ── Anomaly Card ─────────────────────────────────────────────────── */
const DEMO_ANOMALIES = [
  { description: 'Gambling transactions spiked 340% vs last week', severity: 'high',   confidence: 0.96 },
  { description: 'Late-night spending pattern detected (11 PM – 2 AM)', severity: 'medium', confidence: 0.88 },
  { description: '6 duplicate subscription charges this month',   severity: 'medium', confidence: 0.82 },
];

function AnomalyCard({ anomaly, delay: d = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: d }}
      className="flex items-start gap-3 p-3 rounded-xl"
      style={{ background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.18)' }}
    >
      <AlertTriangle size={14} className="text-danger-crimson flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="font-body text-sm text-slate-200">{anomaly.description}</p>
        <p className="font-mono text-xs text-slate-500 mt-0.5">
          Severity: <span style={{ color: anomaly.severity === 'high' ? '#F87171' : '#FCD34D' }}>{anomaly.severity}</span>
          {' · '}Confidence: {Math.round(anomaly.confidence * 100)}%
        </p>
      </div>
    </motion.div>
  );
}

export default function AIInsights({ sidebarOpen, onMenuOpen }) {
  const { wallet } = useWallet();
  const { metrics } = useCompliance(wallet?.wallet_id);
  const { transactions } = useTransactions(wallet?.wallet_id);

  const [voiceResult,  setVoiceResult]  = useState(null);   // { text, offline }
  const [voiceLoading, setVoiceLoading] = useState(false);
  const [actionResult, setActionResult] = useState(null);  // suggestion action result

  const complianceScore  = metrics ? Math.round((metrics.compliance_score ?? 0.87) * 100) : 87;
  const riskLevel        = metrics?.risk_level || 'low';
  const anomalies        = (metrics?.anomalies && metrics.anomalies.length > 0) ? metrics.anomalies : DEMO_ANOMALIES;
  const predictedSavings = metrics?.predicted_savings ?? 12400;

  // Dynamic chart data derived from real state
  const complianceTrend = useMemo(() => buildComplianceTrend(complianceScore), [complianceScore]);
  const timelineEvents  = useMemo(() => buildTimeline(transactions), [transactions]);
  const spendingTrend   = useMemo(() => {
    if (!transactions || transactions.length < 3) return STATIC_SPENDING_TREND;
    const chunkSize = Math.ceil(transactions.length / 5);
    return Array.from({ length: 5 }, (_, i) => {
      const chunk = transactions.slice(i * chunkSize, (i + 1) * chunkSize);
      const amt = chunk.reduce((s, t) => s + (parseFloat(t.amount) || 0), 0);
      return { week: `W${i + 1}`, amount: Math.round(amt), saved: Math.round(amt * 0.15) };
    });
  }, [transactions]);

  // ── Voice command: parse intent and show result inline ─────────────
  const handleVoiceCommand = async (transcript) => {
    if (!transcript.trim()) return;
    setVoiceLoading(true);
    setVoiceResult(null);
    try {
      const walletId = localStorage.getItem(DEMO_WALLET_STORAGE_KEY);
      const result = await parseIntent(transcript, walletId);
      const pct = Math.round((result.confidence || 0) * 100);
      setVoiceResult({
        text: result.response_text || `Parsed "${transcript}" with ${pct}% confidence.`,
        policy: result.policy || null,
        confidence: pct,
        offline: false,
      });
    } catch {
      setVoiceResult({
        text: `Heard: "${transcript}". Backend offline — use Rule Builder to set this up manually.`,
        offline: true,
      });
    } finally {
      setVoiceLoading(false);
    }
  };

  // ── Suggestion action: query AI with the suggestion description ────
  const handleSuggestionAction = async (suggestion) => {
    setActionResult({ loading: true, title: suggestion.title });
    try {
      const walletId = localStorage.getItem(DEMO_WALLET_STORAGE_KEY);
      const result = await parseIntent(suggestion.description, walletId);
      setActionResult({
        loading: false,
        title:   suggestion.title,
        text:    result.response_text || suggestion.description,
        policy:  result.policy || null,
        offline: false,
      });
    } catch {
      setActionResult({
        loading: false,
        title:   suggestion.title,
        text:    `${suggestion.description} — Go to Rule Builder to apply this recommendation.`,
        offline: true,
      });
    }
  };

  return (
    <div>
      <Header title="AI Insights" sidebarOpen={sidebarOpen} onMenuOpen={onMenuOpen} />
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
                Compliance: {complianceScore}/100 · Risk: {riskLevel.toUpperCase()} · {anomalies.length} anomalies detected
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
            { label: 'Predicted Savings',  value: `₹${predictedSavings.toLocaleString('en-IN')}`, icon: TrendingDown, hex: '#059669' },
            { label: 'Risk Alerts',        value: `${anomalies.length} Active`,                    icon: ShieldAlert,  hex: '#DC2626' },
            { label: 'Compliance Score',   value: `${complianceScore}/100`,                        icon: Lightbulb,    hex: '#F97316' },
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

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GlassCard hover={false}>
            <h3 className="font-display font-semibold text-lg text-slate-100 mb-4">Spending vs Savings Trend</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={spendingTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(124,58,237,0.08)" />
                <XAxis dataKey="week" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: 'rgba(14,19,42,0.95)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: '12px' }}
                  labelStyle={{ color: '#F1F5F9' }}
                  formatter={(v) => `₹${v.toLocaleString('en-IN')}`}
                />
                <Line type="monotone" dataKey="amount" stroke="#FF6B00" strokeWidth={2} dot={{ fill: '#FF6B00' }} name="Spending" />
                <Line type="monotone" dataKey="saved"  stroke="#10B981" strokeWidth={2} dot={{ fill: '#10B981' }} name="Saved" />
              </LineChart>
            </ResponsiveContainer>
          </GlassCard>

          <GlassCard hover={false}>
            <h3 className="font-display font-semibold text-lg text-slate-100 mb-4">Compliance Score (7-Day)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={complianceTrend}>
                <defs>
                  <linearGradient id="compGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#7C3AED" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(124,58,237,0.08)" />
                <XAxis dataKey="day" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis domain={[60, 100]} tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: 'rgba(14,19,42,0.95)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: '12px' }}
                  formatter={(v) => [`${v}/100`, 'Score']}
                />
                <Area type="monotone" dataKey="score" stroke="#7C3AED" fill="url(#compGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </GlassCard>
        </div>

        {/* Compliance Timeline + Anomaly Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GlassCard hover={false}>
            <div className="flex items-center gap-2 mb-5">
              <Clock size={16} className="text-trust-electric" />
              <h3 className="font-display font-semibold text-lg text-slate-100">Compliance Timeline</h3>
            </div>
            <ComplianceTimeline events={timelineEvents} />
          </GlassCard>

          <GlassCard hover={false}>
            <div className="flex items-center gap-2 mb-5">
              <AlertTriangle size={16} className="text-danger-crimson" />
              <h3 className="font-display font-semibold text-lg text-slate-100">AI Anomaly Feed</h3>
              <span className="ml-auto font-mono text-xs text-danger-crimson bg-danger-crimson/10 px-2 py-0.5 rounded-full font-bold">
                {anomalies.length} active
              </span>
            </div>
            <div className="space-y-2">
              {anomalies.slice(0, 4).map((a, i) => (
                <AnomalyCard key={i} anomaly={a} delay={i * 0.08} />
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Voice Commands */}
        <GlassCard hover={false}>
          <div className="flex items-center gap-2 mb-4">
            <Zap size={16} className="text-money-gold" />
            <h3 className="font-display font-semibold text-lg text-slate-100">Voice Commands</h3>
          </div>
          <VoiceInput onResult={handleVoiceCommand} />

          {/* Voice result */}
          <AnimatePresence>
            {voiceLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center gap-2 py-3"
              >
                <Loader size={14} className="animate-spin text-trust-electric" />
                <span className="text-sm font-body text-slate-400">Processing command…</span>
              </motion.div>
            )}
            {voiceResult && !voiceLoading && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-3.5 rounded-xl"
                style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(167,139,250,0.25)' }}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  {voiceResult.offline
                    ? <WifiOff size={12} className="text-slate-400" />
                    : <CheckCircle size={12} className="text-success-emerald" />
                  }
                  <span className="font-mono text-[10px] text-slate-400">
                    {voiceResult.offline ? 'offline response' : `${voiceResult.confidence}% confidence`}
                  </span>
                </div>
                <p className="text-sm font-body text-slate-200 leading-relaxed">{voiceResult.text}</p>
              </motion.div>
            )}
          </AnimatePresence>
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

        {/* AI Suggestions */}
        <GlassCard hover={false}>
          <InsightsPanel onApply={handleSuggestionAction} />

          {/* Suggestion action result */}
          <AnimatePresence>
            {actionResult && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-4 p-3.5 rounded-xl"
                style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(167,139,250,0.25)' }}
              >
                {actionResult.loading ? (
                  <div className="flex items-center gap-2">
                    <Loader size={13} className="animate-spin text-trust-electric" />
                    <span className="text-xs font-body text-slate-400">Analysing: {actionResult.title}…</span>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 mb-1.5">
                      {actionResult.offline
                        ? <WifiOff size={11} className="text-slate-400" />
                        : <CheckCircle size={11} className="text-success-emerald" />
                      }
                      <span className="font-mono text-[10px] font-bold text-slate-300">{actionResult.title}</span>
                    </div>
                    <p className="text-sm font-body text-slate-200 leading-relaxed">{actionResult.text}</p>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </GlassCard>
      </div>
    </div>
  );
}
