import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Rocket, Loader2, CheckCircle2 } from 'lucide-react';

export default function DeployButton({ onDeploy }) {
  const [state, setState] = useState('idle'); // idle | deploying | success

  const handleDeploy = async () => {
    setState('deploying');
    await new Promise(r => setTimeout(r, 2000));
    setState('success');
    onDeploy && onDeploy();
    setTimeout(() => setState('idle'), 3000);
  };

  return (
    <motion.button
      whileHover={{ scale: state === 'idle' ? 1.04 : 1 }}
      whileTap={{ scale: state === 'idle' ? 0.96 : 1 }}
      onClick={state === 'idle' ? handleDeploy : undefined}
      disabled={state !== 'idle'}
      className={`
        w-full py-4 rounded-xl font-display font-bold text-base
        flex items-center justify-center gap-3
        transition-all duration-300
        ${state === 'idle' ? 'bg-gradient-primary text-white shadow-glow-blue cursor-pointer' : ''}
        ${state === 'deploying' ? 'bg-violet-100 text-trust-electric cursor-wait' : ''}
        ${state === 'success' ? 'bg-success-emerald/10 text-success-emerald border border-success-emerald/30 cursor-default' : ''}
      `}
    >
      <AnimatePresence mode="wait">
        {state === 'idle' && (
          <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
            <Rocket size={20} />
            <span>Deploy to Blockchain</span>
          </motion.div>
        )}
        {state === 'deploying' && (
          <motion.div key="deploying" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
            <Loader2 size={20} className="animate-spin" />
            <span>Deploying smart contract...</span>
          </motion.div>
        )}
        {state === 'success' && (
          <motion.div key="success" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
            <CheckCircle2 size={20} />
            <span>Deployed Successfully!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
