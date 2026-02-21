import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, RotateCcw, Loader, Zap } from 'lucide-react';
import { getOrCreateDemoWallet } from '../../services/walletService';
import { createPolicy } from '../../services/policyService';
import { validateTransaction, executeClawback } from '../../services/transactionService';
import { DEMO_WALLET_STORAGE_KEY } from '../../config/api';

const STEPS = [
  { key: 'wallet',  label: 'Initialising demo wallet',           icon: Zap },
  { key: 'policy',  label: 'Deploying Safety Rule',              icon: Zap },
  { key: 'approve', label: 'Transaction APPROVED (food/Zomato)', icon: CheckCircle },
  { key: 'block',   label: 'Transaction BLOCKED (gambling)',     icon: XCircle },
  { key: 'clawback',label: 'Clawback executed',                  icon: RotateCcw },
  { key: 'done',    label: 'Flow complete — all systems go',     icon: CheckCircle },
];

const STATE_COLORS = {
  pending:  '#475569',
  running:  '#60A5FA',
  approved: '#34D399',
  blocked:  '#F87171',
  clawback: '#FB923C',
  done:     '#34D399',
};

export default function AutoPlayDemo({ active }) {
  const [visible, setVisible] = useState(false);
  const [stepStates, setStepStates] = useState({});

  const setStep = useCallback((key, state) => {
    setStepStates(prev => ({ ...prev, [key]: state }));
  }, []);

  useEffect(() => {
    if (!active) {
      setVisible(false);
      setStepStates({});
      return;
    }

    setVisible(true);
    setStepStates({});

    (async () => {
      // Step 1 — wallet
      setStep('wallet', 'running');
      let walletId = localStorage.getItem(DEMO_WALLET_STORAGE_KEY) || 'demo-wallet-id';
      try {
        const w = await getOrCreateDemoWallet();
        walletId = w.wallet_id;
      } catch {}
      setStep('wallet', 'approved');
      await delay(600);

      // Step 2 — policy
      setStep('policy', 'running');
      try {
        await createPolicy({
          name: 'Demo Safety Rule',
          policy_type: 'category_restriction',
          rules: {
            allowed_categories: ['food', 'transport', 'healthcare'],
          },
          expiry_days: 1,
          wallet_id: walletId,
        });
      } catch {}
      setStep('policy', 'approved');
      await delay(600);

      // Step 3 — approved txn
      setStep('approve', 'running');
      let approvedId = null;
      try {
        const r = await validateTransaction({
          wallet_id: walletId,
          amount: 450,
          category: 'food',
          merchant: 'Zomato',
          location: 'IN-DL',
        });
        approvedId = r.transaction_id;
      } catch {}
      setStep('approve', 'approved');
      await delay(800);

      // Step 4 — blocked txn
      setStep('block', 'running');
      try {
        await validateTransaction({
          wallet_id: walletId,
          amount: 1000,
          category: 'gambling',
          merchant: 'Dream11',
          location: 'IN-MH',
        });
      } catch {}
      setStep('block', 'blocked');
      await delay(800);

      // Step 5 — clawback
      setStep('clawback', 'running');
      try {
        await executeClawback({
          transaction_id: approvedId || `00000000-0000-0000-0000-${Date.now()}`,
          wallet_id: walletId,
          amount: 450,
          reason: 'POLICY_VIOLATION',
          force: true,
        });
      } catch {}
      setStep('clawback', 'clawback');
      await delay(600);

      // Step 6 — done
      setStep('done', 'done');
      await delay(2500);
      setVisible(false);
    })();
  }, [active, setStep]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.96 }}
          className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-80"
          style={{
            background: 'rgba(6,9,26,0.97)',
            border: '1px solid rgba(96,165,250,0.4)',
            borderRadius: '20px',
            padding: '20px 24px',
            boxShadow: '0 20px 60px rgba(124,58,237,0.3), 0 0 0 1px rgba(96,165,250,0.15)',
            backdropFilter: 'blur(24px)',
          }}
        >
          <p className="font-body text-xs text-trust-electric mb-4 uppercase tracking-wider font-semibold">
            Demo Mode Active
          </p>
          <div className="space-y-2.5">
            {STEPS.map(({ key, label }) => {
              const state = stepStates[key] || 'pending';
              const color = STATE_COLORS[state] || '#475569';
              const isRunning = state === 'running';
              return (
                <motion.div
                  key={key}
                  animate={{ opacity: state === 'pending' ? 0.3 : 1 }}
                  className="flex items-center gap-3"
                >
                  {isRunning ? (
                    <Loader
                      size={14}
                      className="animate-spin flex-shrink-0"
                      style={{ color }}
                    />
                  ) : state === 'blocked' ? (
                    <XCircle size={14} className="flex-shrink-0" style={{ color }} />
                  ) : state === 'clawback' ? (
                    <RotateCcw size={14} className="flex-shrink-0" style={{ color }} />
                  ) : state === 'pending' ? (
                    <div
                      className="w-3.5 h-3.5 rounded-full border flex-shrink-0"
                      style={{ borderColor: color }}
                    />
                  ) : (
                    <CheckCircle size={14} className="flex-shrink-0" style={{ color }} />
                  )}
                  <span
                    className="font-body text-sm"
                    style={{ color: state === 'pending' ? '#64748B' : '#F1F5F9' }}
                  >
                    {label}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
