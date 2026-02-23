import { motion, AnimatePresence } from 'framer-motion';
import { modalVariants } from '../../utils/animations';
import { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, Shield, CheckCircle, Loader, WifiOff } from 'lucide-react';
import { parseIntent } from '../../services/aiService';
import { createPolicy } from '../../services/policyService';
import { DEMO_WALLET_STORAGE_KEY } from '../../config/api';

// Detect whether a message looks like a spending intent vs a general question
function looksLikeIntent(text) {
  const t = text.toLowerCase();
  const intentKeywords = [
    'limit', 'cap', 'spend', 'budget', 'allow', 'block', 'restrict',
    'only', 'maximum', 'minimum', 'rupees', 'inr', '₹', 'per month',
    'per day', 'per week', 'lock', 'fund', 'intent', 'rule', 'policy',
    'create', 'set up', 'enable', 'disable', 'protect', 'prevent',
    'gambling', 'gaming', 'food', 'education', 'category',
  ];
  return intentKeywords.some((kw) => t.includes(kw));
}

// Context-aware offline fallback — no random nonsense
function getOfflineFallback(text) {
  const t = text.toLowerCase();
  if (t.includes('block') || t.includes('gambl') || t.includes('bet') || t.includes('dream11'))
    return 'To block gambling: open **Rule Builder** → select the "Block Gambling Sites" template → click Deploy. This creates an on-chain policy that blocks all gambling category transactions.';
  if (t.includes('limit') || t.includes('cap') || t.includes('spend') || t.includes('budget'))
    return 'To set a spending limit: open **Rule Builder** → choose "Daily Spending Cap" → enter your amount → Deploy. The AI validates every transaction against this limit in real time.';
  if (t.includes('lock') || t.includes('eth') || t.includes('fund') || t.includes('intent'))
    return 'To lock ETH with conditions: go to **Fund Rules** → fill the Create Rule form → set the receiver address, amount, and expiry → click Create Rule.';
  if (t.includes('transaction') || t.includes('history') || t.includes('txn'))
    return 'Your full transaction history is on the **Transactions** page. The Live Validator there lets you test any transaction against your active policies.';
  if (t.includes('score') || t.includes('compliance') || t.includes('risk'))
    return 'Your compliance score is shown on **AI Insights**. It updates based on your transaction patterns. Score 87+ = low risk; below 70 = review your rules.';
  if (t.includes('receiv') || t.includes('claim') || t.includes('withdraw'))
    return 'The Receiver can claim locked ETH on the **Fund Rules** page. The claim button appears on active rules that have not expired yet.';
  return 'The AI backend is currently offline. Start the server (`cd intentforge/backend && python -m uvicorn app.main:app`) to enable intent parsing, policy creation, and personalized advice. In the meantime, use the **Rule Builder** for manual rule creation.';
}

/* ── Inline Policy Deploy Card ─────────────────────────────────────── */
function PolicyDeployCard({ policy, onDeploy, deployed }) {
  const [deploying, setDeploying] = useState(false);

  const handleDeploy = async () => {
    setDeploying(true);
    try { await onDeploy(policy); } finally { setDeploying(false); }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mt-2 rounded-xl p-3"
      style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.28)' }}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <Shield size={11} style={{ color: '#A78BFA' }} />
        <span className="font-body text-xs font-semibold text-violet-300">Parsed Policy</span>
      </div>
      <p className="font-mono text-xs text-slate-200 mb-0.5">{policy.name || 'New Policy'}</p>
      <p className="font-body text-xs text-slate-400 mb-2.5">
        {(policy.policy_type || '').replace(/_/g, ' ')}
        {policy.max_amount ? ` · ₹${policy.max_amount.toLocaleString('en-IN')}` : ''}
      </p>
      {deployed ? (
        <div className="flex items-center gap-1.5">
          <CheckCircle size={11} className="text-success-emerald" />
          <span className="font-body text-xs text-success-emerald">Deployed successfully</span>
        </div>
      ) : (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleDeploy}
          disabled={deploying}
          className="w-full py-1.5 rounded-lg text-xs font-body font-semibold disabled:opacity-40"
          style={{ background: 'linear-gradient(135deg,#7C3AED,#C026D3)', color: '#fff' }}
        >
          {deploying
            ? <span className="flex items-center justify-center gap-1"><Loader size={10} className="animate-spin" /> Deploying…</span>
            : 'Deploy Rule'
          }
        </motion.button>
      )}
    </motion.div>
  );
}

/* ── Main ChatPanel ─────────────────────────────────────────────────── */
export default function ChatPanel({ isOpen, onClose, onPolicyDeploy }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: "Hi! I'm your AI financial copilot. Ask me to create rules, analyze spending, or protect your wallet. 🚀" }
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const sendMessage = async (text) => {
    if (!text.trim()) return;

    // Guard: too short
    if (text.trim().length < 3) {
      setMessages(m => [...m, { role: 'user', text }, { role: 'assistant', text: 'Please type at least a few words.' }]);
      setInput('');
      return;
    }

    setMessages(m => [...m, { role: 'user', text }]);
    setInput('');

    // General questions go straight to the offline fallback — no API call
    if (!looksLikeIntent(text)) {
      setMessages(m => [...m, { role: 'assistant', text: getOfflineFallback(text), offline: false }]);
      return;
    }

    setTyping(true);

    try {
      const walletId = localStorage.getItem(DEMO_WALLET_STORAGE_KEY);
      const result = await parseIntent(text, walletId);
      setTyping(false);

      const { policy, confidence, extracted_components, response_text } = result || {};
      const pct = Math.round((confidence || 0) * 100);
      let reply = response_text || '';
      if (!reply) {
        if (extracted_components?.action === 'block') {
          reply = `Intent parsed with ${pct}% confidence. I'll block ${extracted_components.categories?.join(', ') || 'that category'}.`;
        } else if (extracted_components?.amount) {
          reply = `Got it! ₹${Number(extracted_components.amount).toLocaleString('en-IN')} limit ready — ${pct}% confidence.`;
        } else {
          reply = `Parsed with ${pct}% confidence.${extracted_components?.description ? ' ' + extracted_components.description : ''}`;
        }
      }
      setMessages(m => [...m, { role: 'assistant', text: reply, policy: policy || null, confidence: pct }]);
    } catch (err) {
      setTyping(false);
      const isOffline = !err.status;
      setMessages(m => [...m, {
        role: 'assistant',
        text: isOffline
          ? getOfflineFallback(text)
          : (err.message && !err.message.startsWith('[') ? err.message : 'Could not parse that intent — try rephrasing.'),
        offline: isOffline,
      }]);
    }
  };

  const handlePolicyDeploy = async (policy) => {
    try {
      const walletId = localStorage.getItem(DEMO_WALLET_STORAGE_KEY);
      const deployed = await createPolicy({ ...policy, ...(walletId ? { wallet_id: walletId } : {}) });
      onPolicyDeploy && onPolicyDeploy(deployed);
    } catch { /* optimistic */ }
    setMessages(m => m.map(msg => msg.policy === policy ? { ...msg, policyDeployed: true } : msg));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-violet-950/20 backdrop-blur-sm z-40"
          />
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed bottom-24 right-4 md:right-6 z-50 w-[calc(100vw-2rem)] max-w-sm"
          >
            <div className="border border-violet-900/40 rounded-3xl overflow-hidden shadow-2xl" style={{ background: 'rgba(10,14,30,0.97)' }}>
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-gradient-primary">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: [0, 15, -15, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"
                  >
                    <Sparkles size={18} className="text-white" />
                  </motion.div>
                  <div>
                    <p className="font-display font-bold text-white text-sm">IntentForge AI</p>
                    <p className="text-xs text-white/60">Intent-aware copilot</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10"
                  aria-label="Close chat"
                >
                  <X size={18} />
                </motion.button>
              </div>

              {/* Messages */}
              <div className="h-72 overflow-y-auto p-4 space-y-3" style={{ scrollbarWidth: 'none' }}>
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[88%] px-4 py-3 rounded-2xl text-sm font-body leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-trust-electric text-white rounded-br-sm'
                        : 'bg-violet-900/30 border border-violet-800/30 text-slate-100 rounded-bl-sm'
                    }`}>
                      {msg.text}
                      {msg.offline && (
                        <p className="flex items-center gap-1 font-mono text-[10px] mt-1.5 opacity-50">
                          <WifiOff size={9} /> offline mode
                        </p>
                      )}
                      {msg.confidence > 0 && msg.role === 'assistant' && (
                        <p className="font-mono text-[10px] mt-1 opacity-60">{msg.confidence}% confidence</p>
                      )}
                      {msg.policy && (
                        <PolicyDeployCard
                          policy={msg.policy}
                          onDeploy={handlePolicyDeploy}
                          deployed={msg.policyDeployed || false}
                        />
                      )}
                    </div>
                  </motion.div>
                ))}
                {typing && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                    <div className="bg-violet-900/30 border border-violet-800/30 px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1">
                      {[0, 1, 2].map(i => (
                        <motion.div
                          key={i}
                          animate={{ y: [0, -6, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                          className="w-2 h-2 rounded-full bg-trust-electric"
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="px-4 pb-4">
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-violet-900/20 border border-violet-800/30">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
                    placeholder="Ask me anything…"
                    className="flex-1 bg-transparent text-sm font-body text-slate-100 placeholder-slate-400 outline-none"
                  />
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => sendMessage(input)}
                    disabled={!input.trim()}
                    className="p-1.5 rounded-lg bg-trust-electric text-white disabled:opacity-30"
                    aria-label="Send message"
                  >
                    <Send size={16} />
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
