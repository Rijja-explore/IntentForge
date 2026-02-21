import { motion, AnimatePresence } from 'framer-motion';
import { modalVariants } from '../../utils/animations';
import { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles } from 'lucide-react';


const AI_RESPONSES = [
  "I can help you create a rule to limit that! Based on your spending patterns, I recommend capping ₹2,000 per day for this category.",
  "Great idea! I'll set up automatic blocking for gambling sites. Your financial safety is my priority.",
  "Analyzing your transactions... I found 3 unusual patterns. Would you like me to create protective rules?",
  "Your trust score is 87/100 - excellent! Here's how to push it to 95: block 2 risky merchants.",
  "I've detected your recurring subscriptions. You're spending ₹4,200/month on services you barely use.",
];

export default function ChatPanel({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hi! I\'m your AI financial copilot. Ask me to create rules, analyze spending, or protect your wallet. 🚀' }
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const sendMessage = async (text) => {
    if (!text.trim()) return;
    setMessages(m => [...m, { role: 'user', text }]);
    setInput('');
    setTyping(true);
    await new Promise(r => setTimeout(r, 1200));
    setTyping(false);
    const response = AI_RESPONSES[Math.floor(Math.random() * AI_RESPONSES.length)];
    setMessages(m => [...m, { role: 'assistant', text: response }]);
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
                    <p className="text-xs text-white/60">Always on, always smart</p>
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
              <div className="h-64 overflow-y-auto p-4 space-y-3">
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`
                      max-w-[85%] px-4 py-3 rounded-2xl text-sm font-body leading-relaxed
                      ${msg.role === 'user'
                        ? 'bg-trust-electric text-white rounded-br-sm'
                        : 'bg-violet-900/30 border border-violet-800/30 text-slate-100 rounded-bl-sm'
                      }
                    `}>
                      {msg.text}
                    </div>
                  </motion.div>
                ))}
                {typing && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
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

              {/* Voice + Input */}
              <div className="px-4 pb-4">
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-violet-900/20 border border-violet-800/30">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
                    placeholder="Ask me anything..."
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
