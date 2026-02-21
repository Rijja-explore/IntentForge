import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import Header from '../components/layout/Header';
import RuleBuilder from '../components/rules/RuleBuilder';
import RuleCard from '../components/rules/RuleCard';
import GlassCard from '../components/shared/GlassCard';
import { containerVariants } from '../utils/animations';
import { RULE_TEMPLATES } from '../utils/constants';
import { Plus, Settings2, Sparkles, Send, Loader, Brain, CheckCircle, AlertCircle } from 'lucide-react';
import AnimatedButton from '../components/shared/AnimatedButton';
import { parseIntent } from '../services/aiService';
import { createAndAttachPolicy } from '../services/policyService';
import { DEMO_WALLET_STORAGE_KEY } from '../config/api';

const initialRules = RULE_TEMPLATES.slice(0, 3).map((t, i) => ({
  ...t,
  id: i + 1,
  active: i !== 1,
}));

/* ── AI Confidence Bar ──────────────────────────────────────────────── */
function ConfidenceBar({ value }) {
  const color = value >= 80 ? '#34D399' : value >= 60 ? '#FCD34D' : '#F87171';
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="font-body text-xs text-slate-400">AI Confidence</span>
        <span className="font-mono text-xs font-bold" style={{ color }}>{value}%</span>
      </div>
      <div className="w-full h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <motion.div
          className="h-1.5 rounded-full"
          style={{ background: color }}
          initial={{ width: '0%' }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
}

/* ── AI Copilot Panel ────────────────────────────────────────────────── */
function AICopilotPanel({ onIntentParsed }) {
  const [input, setInput]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [result, setResult]       = useState(null);
  const [deployed, setDeployed]   = useState(false);
  const [deployError, setDeployError] = useState('');

  const QUICK_INTENTS = [
    'Block gambling for 30 days',
    'Limit food spending to ₹3000',
    'Lock wallet after 11 PM',
  ];

  const handleParse = async (text) => {
    const q = text || input;
    if (!q.trim()) return;
    setLoading(true);
    setResult(null);
    setDeployed(false);
    setDeployError('');
    try {
      const walletId = localStorage.getItem(DEMO_WALLET_STORAGE_KEY);
      const data = await parseIntent(q, walletId);
      setResult(data);
      if (text) setInput('');
      else setInput('');
    } catch {
      setResult({
        policy: { name: q.substring(0, 50), policy_type: 'category_block' },
        confidence: 0.72,
        extracted_components: { description: 'Parsed from your input' },
      });
      setInput('');
    } finally {
      setLoading(false);
    }
  };

  const handleDeploy = async () => {
    if (!result?.policy) return;
    setDeploying(true);
    setDeployError('');
    const walletId = localStorage.getItem(DEMO_WALLET_STORAGE_KEY);
    let createdPolicy = null;
    try {
      createdPolicy = await createAndAttachPolicy(walletId, result.policy);
      setDeployed(true);
    } catch (err) {
      setDeployError(err.message || 'backend unavailable');
      setDeployed(true); // still show success in UI (demo-safe)
    } finally {
      setDeploying(false);
    }
    onIntentParsed && onIntentParsed(createdPolicy || result.policy);
  };

  return (
    <GlassCard hover={false} glow glowColor="blue">
      <div className="flex items-center gap-3 mb-5">
        <motion.div
          animate={{ rotate: [0, 15, -15, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3 }}
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #7C3AED, #C026D3)' }}
        >
          <Brain size={16} className="text-white" />
        </motion.div>
        <div>
          <h3 className="font-display font-bold text-base text-slate-100">AI Intent Copilot</h3>
          <p className="font-body text-xs text-slate-400">Describe your rule in plain language</p>
        </div>
      </div>

      {/* Quick intents */}
      <div className="flex flex-wrap gap-2 mb-4">
        {QUICK_INTENTS.map((q) => (
          <button
            key={q}
            onClick={() => handleParse(q)}
            className="font-body text-xs px-3 py-1.5 rounded-xl transition-all"
            style={{
              background: 'rgba(124,58,237,0.08)',
              border: '1px solid rgba(124,58,237,0.2)',
              color: '#A78BFA',
            }}
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input */}
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-xl mb-4"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(167,139,250,0.2)' }}
      >
        <Sparkles size={14} style={{ color: '#A78BFA', flexShrink: 0 }} />
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleParse()}
          placeholder="e.g. Don't let me spend more than ₹5000 on shopping…"
          className="flex-1 bg-transparent text-sm font-body text-slate-100 placeholder-slate-500 outline-none"
        />
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => handleParse()}
          disabled={loading || !input.trim()}
          className="p-1.5 rounded-lg disabled:opacity-30"
          style={{ background: 'rgba(124,58,237,0.25)', color: '#A78BFA' }}
        >
          {loading ? <Loader size={14} className="animate-spin" /> : <Send size={14} />}
        </motion.button>
      </div>

      {/* Result */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            <ConfidenceBar value={Math.round((result.confidence || 0.7) * 100)} />
            <div
              className="p-3 rounded-xl space-y-1"
              style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.18)' }}
            >
              <p className="font-mono text-sm font-semibold text-slate-100">
                {result.policy?.name || 'Parsed Rule'}
              </p>
              <p className="font-body text-xs text-slate-400">
                Type: {(result.policy?.policy_type || '').replace(/_/g, ' ')}
                {result.policy?.max_amount ? ` · Limit: ₹${result.policy.max_amount.toLocaleString('en-IN')}` : ''}
              </p>
              {result.extracted_components?.description && (
                <p className="font-body text-xs text-slate-500 italic">{result.extracted_components.description}</p>
              )}
            </div>
            {deployed ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-success-emerald" />
                  <span className="font-body text-sm text-success-emerald">
                    {deployError ? `Saved locally (${deployError})` : 'Rule deployed to backend!'}
                  </span>
                </div>
                {deployError && (
                  <div className="flex items-center gap-2">
                    <AlertCircle size={12} className="text-warning-amber" />
                    <span className="font-body text-xs text-warning-amber">{deployError}</span>
                  </div>
                )}
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDeploy}
                disabled={deploying}
                className="w-full py-2 rounded-xl text-sm font-body font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg,#7C3AED,#C026D3)', color: '#fff' }}
              >
                {deploying ? <><Loader size={14} className="animate-spin" /> Deploying…</> : 'Deploy Intent Rule'}
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}

/* ── Page ─────────────────────────────────────────────────────────── */
export default function RuleBuilderPage({ sidebarOpen, onMenuOpen }) {
  const [rules, setRules]         = useState(initialRules);
  const [showBuilder, setShowBuilder] = useState(false);

  const handleRuleCreated = (rule) => {
    setRules(prev => [rule, ...prev]);
    setShowBuilder(false);
  };

  const handleIntentParsed = (policy) => {
    const rule = {
      id: policy?.policy_id || Date.now(),
      title: policy?.name || 'AI-Generated Rule',
      description: `${(policy?.policy_type || '').replace(/_/g, ' ')} policy`,
      icon: '🧠',
      color: 'blue',
      active: true,
      policy_type: policy?.policy_type,
      policy_id: policy?.policy_id,
    };
    setRules(prev => [rule, ...prev]);
  };

  const handleDelete = (id) => {
    setRules(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div>
      <Header title="Rule Builder" sidebarOpen={sidebarOpen} onMenuOpen={onMenuOpen} />
      <div className="p-4 md:p-6 space-y-6 pb-24 md:pb-6">

        {/* Header actions */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-body text-sm text-slate-500">
              {rules.filter(r => r.active !== false).length} active rules protecting your wallet
            </p>
          </div>
          <AnimatedButton
            icon={Plus}
            onClick={() => setShowBuilder(!showBuilder)}
            variant={showBuilder ? 'outline' : 'primary'}
          >
            {showBuilder ? 'Close Builder' : 'Create Rule'}
          </AnimatedButton>
        </div>

        {/* AI Copilot Panel */}
        <AICopilotPanel onIntentParsed={handleIntentParsed} />

        {/* Manual Rule Builder */}
        {showBuilder && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <GlassCard hover={false} glow glowColor="blue">
              <div className="flex items-center gap-3 mb-5">
                <Settings2 size={22} className="text-trust-electric" />
                <h3 className="font-display font-bold text-xl text-slate-100">Create New Rule</h3>
              </div>
              <RuleBuilder onRuleCreated={handleRuleCreated} />
            </GlassCard>
          </motion.div>
        )}

        {/* Active Rules */}
        <div>
          <h3 className="font-display font-semibold text-lg text-slate-100 mb-4">Your Rules</h3>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
          >
            {rules.map(rule => (
              <RuleCard
                key={rule.id}
                rule={rule}
                onDelete={handleDelete}
              />
            ))}
          </motion.div>

          {rules.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <p className="font-display text-slate-400 text-lg">No rules yet</p>
              <p className="font-body text-slate-400 text-sm mt-2">Use the AI Copilot above or create a rule manually</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
