import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { SPENDING_DATA } from '../../utils/constants';

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-4 py-3 shadow-glass" style={{ background: 'rgba(14,19,42,0.95)', border: '1px solid rgba(167,139,250,0.2)' }}>
      <p className="font-body text-xs text-slate-400 mb-1">{payload[0].name}</p>
      <p className="font-mono font-bold text-slate-100">₹{payload[0].value.toLocaleString('en-IN')}</p>
    </div>
  );
};

export default function SpendingChart() {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie
          data={SPENDING_DATA}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={3}
          dataKey="value"
          stroke="none"
        >
          {SPENDING_DATA.map((entry, i) => (
            <Cell key={`cell-${i}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          formatter={(value) => <span className="font-body text-xs text-slate-500">{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
