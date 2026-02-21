import { motion } from 'framer-motion';
import { useState } from 'react';
import TemplateSelector from './TemplateSelector';
import CategoryPicker from './CategoryPicker';
import AmountInput from './AmountInput';
import DeployButton from './DeployButton';
import GlassCard from '../shared/GlassCard';
import { Settings2, ChevronRight } from 'lucide-react';

export default function RuleBuilder({ onRuleCreated }) {
  const [step, setStep] = useState(1); // 1: template, 2: customize, 3: review
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [categories, setCategories] = useState([]);
  const [amount, setAmount] = useState('');
  const [ruleName, setRuleName] = useState('');

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setRuleName(template.title);
    setStep(2);
  };

  const handleDeploy = () => {
    const newRule = {
      id: Date.now(),
      title: ruleName || selectedTemplate?.title || 'Custom Rule',
      description: selectedTemplate?.description || 'Custom programmable rule',
      icon: selectedTemplate?.icon || '⚡',
      color: selectedTemplate?.color || 'blue',
      active: true,
      rule: {
        ...selectedTemplate?.rule,
        categories,
        amount,
      },
    };
    onRuleCreated && onRuleCreated(newRule);
    setStep(1);
    setSelectedTemplate(null);
    setCategories([]);
    setAmount('');
  };

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <motion.div
              animate={step >= s ? { backgroundColor: '#3E92CC' } : { backgroundColor: 'rgba(255,255,255,0.1)' }}
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-mono font-bold text-white"
            >
              {s}
            </motion.div>
            {s < 3 && <ChevronRight size={16} className="text-white/30" />}
          </div>
        ))}
        <span className="ml-2 text-sm font-body text-white/50">
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
              <div>
                <input
                  value={ruleName}
                  onChange={(e) => setRuleName(e.target.value)}
                  className="bg-transparent font-display font-bold text-xl text-white outline-none border-b border-white/20 focus:border-trust-electric pb-1 w-full"
                />
                <p className="font-body text-sm text-white/50 mt-1">{selectedTemplate.description}</p>
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
          </GlassCard>

          <DeployButton onDeploy={handleDeploy} disabled={!ruleName} />
        </motion.div>
      )}
    </div>
  );
}
