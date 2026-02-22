import { motion } from 'framer-motion';
import { useState } from 'react';
import TemplateSelector from './TemplateSelector';
import CategoryPicker from './CategoryPicker';
import AmountInput from './AmountInput';
import DeployButton from './DeployButton';
import GlassCard from '../shared/GlassCard';
import { ChevronRight, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { createPolicy } from '../../services/policyService';
import { DEMO_WALLET_STORAGE_KEY } from '../../config/api';

const POLICY_TYPE_MAP = {
  'daily_limit':        'daily_limit',
  'category_block':     'category_block',
  'time_restriction':   'time_restriction',
  'merchant_whitelist': 'merchant_whitelist',
  'savings_lock':       'savings_lock',
  'single_limit':       'single_limit',
};

export default function RuleBuilder({ onRuleCreated }) {
  const [step, setStep]                         = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [categories, setCategories]             = useState([]);
  const [amount, setAmount]                     = useState('');
  const [ruleName, setRuleName]                 = useState('');
  const [deploying, setDeploying]               = useState(false);
  const [deployStatus, setDeployStatus]         = useState(null); // null | 'success' | 'error'
  const [deployError, setDeployError]           = useState('');

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setRuleName(template.title);
    setDeployStatus(null);
    setStep(2);
  };

  const handleDeploy = async () => {
    setDeploying(true);
    setDeployStatus(null);
    setDeployError('');

    const walletId = localStorage.getItem(DEMO_WALLET_STORAGE_KEY);

    const payload = {
      name: ruleName || selectedTemplate?.title || 'Custom Rule',
      policy_type: POLICY_TYPE_MAP[selectedTemplate?.rule?.type] || 'category_block',
      allowed_categories: categories.length > 0 ? categories : undefined,
      max_amount: amount ? parseFloat(amount) : undefined,
      per_transaction_cap: amount ? parseFloat(amount) : undefined,
      expiry_days: 90,
      ...(walletId ? { wallet_id: walletId } : {}),
    };

    // Remove undefined keys before sending
    Object.keys(payload).forEach(k => payload[k] === undefined && delete payload[k]);

    let apiPolicy = null;
    try {
      apiPolicy = await createPolicy(payload);
      setDeployStatus('success');
    } catch (err) {
      setDeployError(err.message || 'API unavailable');
      setDeployStatus('error');
    }

    const newRule = {
      id: apiPolicy?.policy_id || Date.now(),
      title: ruleName || selectedTemplate?.title || 'Custom Rule',
      description: selectedTemplate?.description || 'Custom programmable rule',
      icon: selectedTemplate?.icon || '⚡',
      color: selectedTemplate?.color || 'blue',
      active: true,
      rule: { ...selectedTemplate?.rule, categories, amount },
      policy_id: apiPolicy?.policy_id,
    };

    setDeploying(false);
    onRuleCreated && onRuleCreated(newRule);
    setStep(1);
    setSelectedTemplate(null);
    setCategories([]);
    setAmount('');
    setTimeout(() => setDeployStatus(null), 0);
  };

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <motion.div
              animate={step >= s ? { backgroundColor: '#7C3AED' } : { backgroundColor: 'rgba(124,58,237,0.1)' }}
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-mono font-bold text-white"
            >
              {s}
            </motion.div>
            {s < 3 && <ChevronRight size={16} className="text-slate-300" />}
          </div>
        ))}
        <span className="ml-2 text-sm font-body text-slate-400">
          {step === 1 ? 'Choose Template' : step === 2 ? 'Customize Rule' : 'Review & Deploy'}
        </span>
      </div>

      {step === 1 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <TemplateSelector onSelect={handleTemplateSelect} />
        </motion.div>
      )}

      {step >= 2 && selectedTemplate && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          <GlassCard hover={false}>
            <div className="flex items-center gap-4 mb-5">
              <span className="text-4xl">{selectedTemplate.icon}</span>
              <div className="flex-1 min-w-0">
                <input
                  value={ruleName}
                  onChange={(e) => setRuleName(e.target.value)}
                  className="bg-transparent font-display font-bold text-xl text-slate-100 outline-none border-b border-violet-100 focus:border-trust-electric pb-1 w-full"
                />
                <p className="font-body text-sm text-slate-400 mt-1">{selectedTemplate.description}</p>
              </div>
            </div>

            <div className="space-y-5">
              <CategoryPicker selected={categories} onChange={setCategories} />
              <AmountInput
                label="Amount Threshold (₹)"
                value={amount}
                onChange={setAmount}
              />
            </div>

            {deployStatus === 'success' && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 flex items-center gap-2 px-3 py-2 rounded-xl"
                style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)' }}
              >
                <CheckCircle size={14} className="text-success-emerald" />
                <span className="font-body text-sm text-success-emerald">Rule deployed to backend successfully</span>
              </motion.div>
            )}
            {deployStatus === 'error' && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 flex items-center gap-2 px-3 py-2 rounded-xl"
                style={{ background: 'rgba(252,211,77,0.08)', border: '1px solid rgba(252,211,77,0.2)' }}
              >
                <AlertCircle size={14} className="text-warning-amber" />
                <span className="font-body text-sm text-warning-amber">
                  Saved locally ({deployError || 'backend offline'})
                </span>
              </motion.div>
            )}
          </GlassCard>

          <DeployButton
            onDeploy={handleDeploy}
            disabled={!ruleName || deploying}
            label={deploying
              ? <span className="flex items-center gap-2"><Loader size={14} className="animate-spin" />Deploying…</span>
              : undefined
            }
          />
        </motion.div>
      )}
    </div>
  );
}
