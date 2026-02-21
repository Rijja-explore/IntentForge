import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Rocket, CheckCircle, Loader2 } from 'lucide-react';

export default function DeployButton({ onDeploy, disabled = false }) {
  const [state, setState] = useState('idle'); // idle | deploying | success

  const handleDeploy = async () => {
    if (disabled || state !== 'idle') return;
    setState('deploying');
    await new Promise(r => setTimeout(r, 2000));
    setState('success');
    onDeploy && onDeploy();
    setTimeout(() => setState('idle'), 3000);
  };

  return (
    <motion.button
      whileHover={state === 'idle' && !disabled ? { scale: 1.05 } : {}}
      whileTap={state === 'idle' && !disabled ? { scale: 0.95 } : {}}
      onClick={handleDeploy}
      disabled={disabled || state !== 'idle'}
      className={`
        w-full py-4 rounded-xl font-display font-bold text-lg
        flex items-center justify-center gap-3
        transition-all duration-500
        disabled:opacity-50 disabled:cursor-not-allowed
        ${state === 'success'
          ? 'bg-success-emerald/20 border border-success-emerald text-success-emerald shadow-glow-green'
          : 'bg-gradient-primary text-white shadow-glow-blue'
        }
      `}
    >
      <AnimatePresence mode="wait">
        {state === 'idle' && (
          <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-3">
            <Rocket size={22} />
            <span>Deploy to Blockchain</span>
          </motion.div>
        )}
        {state === 'deploying' && (
          <motion.div key="deploying" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-3">
            <Loader2 size={22} className="animate-spin" />
            <span>Deploying Smart Contract...</span>
          </motion.div>
        )}
        {state === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3"
          >
            <CheckCircle size={22} />
            <span>Rule Deployed Successfully!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
