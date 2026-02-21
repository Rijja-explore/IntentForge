import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Brain } from 'lucide-react';
import { useState } from 'react';
import ChatPanel from './ChatPanel';

function Ring({ size, delay, color, speed = 2.5 }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size,
        height: size,
        top: '50%',
        left: '50%',
        x: '-50%',
        y: '-50%',
        border: `1.5px solid ${color}`,
      }}
      animate={{
        scale: [1, 2, 2],
        opacity: [0.5, 0, 0],
      }}
      transition={{
        duration: speed,
        repeat: Infinity,
        delay,
        ease: 'easeOut',
      }}
    />
  );
}

export default function CopilotOrb() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Orb button */}
      <div className="fixed bottom-20 md:bottom-8 right-4 md:right-8 z-50">
        {/* Pulsing rings */}
        {!isOpen && (
          <div className="absolute inset-0 w-16 h-16 flex items-center justify-center pointer-events-none">
            <Ring size={64} delay={0} color="rgba(124,58,237,0.6)" speed={2.5} />
            <Ring size={64} delay={0.8} color="rgba(192,38,211,0.4)" speed={2.5} />
            <Ring size={64} delay={1.6} color="rgba(249,115,22,0.3)" speed={2.5} />
          </div>
        )}

        <motion.button
          whileHover={{ scale: 1.12 }}
          whileTap={{ scale: 0.88 }}
          animate={isOpen ? {} : {
            y: [0, -8, 0],
          }}
          transition={isOpen ? {} : {
            y: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
          }}
          onClick={() => setIsOpen(!isOpen)}
          className="relative w-16 h-16 rounded-full flex items-center justify-center text-white overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #3B0764 0%, #7C3AED 40%, #C026D3 70%, #F97316 100%)',
            boxShadow: isOpen
              ? '0 0 30px rgba(124,58,237,0.6), 0 0 60px rgba(124,58,237,0.3)'
              : '0 0 20px rgba(124,58,237,0.5), 0 0 40px rgba(124,58,237,0.25)',
          }}
          aria-label="Open AI Copilot"
        >
          {/* Rotating gradient ring inside */}
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            style={{
              background: 'conic-gradient(from 0deg, transparent, rgba(255,255,255,0.2), transparent)',
            }}
          />

          <motion.div
            animate={{ rotate: isOpen ? 180 : 0, scale: isOpen ? 0.8 : 1 }}
            transition={{ duration: 0.4, type: 'spring', stiffness: 200, damping: 15 }}
            className="relative z-10"
          >
            {isOpen ? <X size={24} /> : <Sparkles size={26} />}
          </motion.div>

          {/* Online dot */}
          {!isOpen && (
            <motion.div
              className="absolute top-0 right-0 w-4 h-4 rounded-full bg-success-emerald"
              style={{ border: '2px solid white', boxShadow: '0 0 8px rgba(5,150,105,0.6)' }}
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </motion.button>

        {/* Label pill */}
        <AnimatePresence>
          {!isOpen && (
            <motion.div
              initial={{ opacity: 0, x: 10, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 10, scale: 0.8 }}
              className="absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap"
            >
              <div className="flex items-center gap-1.5 border shadow-glass rounded-full px-3 py-1.5" style={{ background: 'rgba(14,19,42,0.9)', borderColor: 'rgba(167,139,250,0.2)' }}>
                <Brain size={12} className="text-trust-electric" />
                <span className="text-xs font-body font-semibold text-slate-100">AI Copilot</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ChatPanel isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
