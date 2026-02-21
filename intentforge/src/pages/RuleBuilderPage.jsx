import { motion } from 'framer-motion';
import { useState } from 'react';
import Header from '../components/layout/Header';
import RuleBuilder from '../components/rules/RuleBuilder';
import RuleCard from '../components/rules/RuleCard';
import GlassCard from '../components/shared/GlassCard';
import { containerVariants } from '../utils/animations';
import { RULE_TEMPLATES } from '../utils/constants';
import { Plus, Settings2 } from 'lucide-react';
import AnimatedButton from '../components/shared/AnimatedButton';

const initialRules = RULE_TEMPLATES.slice(0, 3).map((t, i) => ({
  ...t,
  id: i + 1,
  active: i !== 1,
}));

export default function RuleBuilderPage() {
  const [rules, setRules] = useState(initialRules);
  const [showBuilder, setShowBuilder] = useState(false);

  const handleRuleCreated = (rule) => {
    setRules(prev => [rule, ...prev]);
    setShowBuilder(false);
  };

  const handleDelete = (id) => {
    setRules(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div>
      <Header title="Rule Builder" />
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

        {/* Rule Builder */}
        {showBuilder && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <GlassCard hover={false} glow glowColor="blue">
              <div className="flex items-center gap-3 mb-5">
                <Settings2 size={22} className="text-trust-electric" />
                <h3 className="font-display font-bold text-xl text-violet-950">Create New Rule</h3>
              </div>
              <RuleBuilder onRuleCreated={handleRuleCreated} />
            </GlassCard>
          </motion.div>
        )}

        {/* Active Rules */}
        <div>
          <h3 className="font-display font-semibold text-lg text-violet-950 mb-4">Your Rules</h3>
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
              <p className="font-body text-slate-400 text-sm mt-2">Create your first rule to protect your wallet</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
