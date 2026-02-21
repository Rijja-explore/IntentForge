import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { SPENDING_DATA } from '../../utils/constants';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-neutral-charcoal border border-white/20 rounded-xl px-4 py-3">
        <p className="font-body font-semibold text-white text-sm">{payload[0].name}</p>
        <p className="font-mono text-money-gold text-sm">₹{payload[0].value.toLocaleString('en-IN')}</p>
      </div>
    );
  }
  return null;
};

export default function SpendingChart() {
  const total = SPENDING_DATA.reduce((s, d) => s + d.value, 0);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.3 }}
      className="flex flex-col md:flex-row items-center gap-6"
    >
      <div className="relative w-48 h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={SPENDING_DATA}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={75}
              paddingAngle={3}
              dataKey="value"
            >
              {SPENDING_DATA.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="font-body text-xs text-white/50">Total</p>
          <p className="font-mono font-bold text-white text-lg">₹{(total / 1000).toFixed(1)}k</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 flex-1">
        {SPENDING_DATA.map((item) => (
          <div key={item.name} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
            <div>
              <p className="font-body text-xs text-white/70">{item.name}</p>
              <p className="font-mono text-xs font-semibold text-white">₹{(item.value / 1000).toFixed(1)}k</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
