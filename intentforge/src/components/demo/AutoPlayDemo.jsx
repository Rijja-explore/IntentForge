import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

const DEMO_STEPS = [
  'Simulating high-value transaction...',
  'Rule engine evaluating conditions...',
  'Checking spending limits...',
  'Verifying merchant category...',
  'Smart contract executing...',
  'Transaction decision: APPROVED ✅',
];

export default function AutoPlayDemo({ active }) {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!active) { setVisible(false); setStep(0); return; }
    setVisible(true);
    const interval = setInterval(() => {
      setStep(s => {
        if (s >= DEMO_STEPS.length - 1) {
          clearInterval(interval);
          setTimeout(() => setVisible(false), 2000);
          return s;
        }
        return s + 1;
      });
    }, 800);
    return () => clearInterval(interval);
  }, [active]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-6 left-1/2 -translate-x-1/2 z-50
            bg-neutral-charcoal border border-trust-electric/50
            rounded-2xl px-6 py-4 shadow-glow-blue w-80"
        >
          <p className="font-body text-xs text-trust-electric mb-3 uppercase tracking-wider">Demo Mode Active</p>
          <div className="space-y-2">
            {DEMO_STEPS.map((s, i) => (
              <motion.div
                key={s}
                initial={{ opacity: 0, x: -10 }}
                animate={i <= step ? { opacity: 1, x: 0 } : { opacity: 0.2 }}
                className="flex items-center gap-2 text-sm font-body"
              >
                {i < step ? (
                  <CheckCircle size={14} className="text-success-emerald flex-shrink-0" />
                ) : i === step ? (
                  <motion.div
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                    className="w-3.5 h-3.5 rounded-full bg-trust-electric flex-shrink-0"
                  />
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full border border-white/20 flex-shrink-0" />
                )}
                <span className={i <= step ? 'text-white' : 'text-white/30'}>{s}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
