/* ─── Transaction Simulator ─────────────────────────────────────────
 * Simulates transactions through the validation engine.
 * Location is mapped to ISO 3166-2:IN state codes (e.g., IN-MH) for
 * geo-fence checks in the backend. GPS auto-detect finds nearest city.
 * ─────────────────────────────────────────────────────────────── */

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Play, Loader, CheckCircle, XCircle, AlertTriangle, RotateCcw, MapPin, Navigation } from 'lucide-react';
import { MERCHANTS } from '../../utils/constants';
import { simulateTransaction, getDecisionMeta, executeClawback } from '../../services/transactionService';
import { DEMO_WALLET_STORAGE_KEY } from '../../config/api';
import GlassCard from '../shared/GlassCard';

const STATUS_ICON = {
  APPROVED:          { Icon: CheckCircle,   class: 'text-success-emerald' },
  BLOCKED:           { Icon: XCircle,       class: 'text-danger-crimson' },
  VIOLATION:         { Icon: AlertTriangle, class: 'text-warning-amber' },
  CLAWBACK_REQUIRED: { Icon: RotateCcw,     class: 'text-money-gold' },
};

// City display name → ISO 3166-2:IN state code used in backend geo-fence checks
const CITY_CODE_MAP = {
  'Mumbai':    'IN-MH',
  'Delhi':     'IN-DL',
  'Bangalore': 'IN-KA',
  'Hyderabad': 'IN-TS',
  'Chennai':   'IN-TN',
  'Pune':      'IN-MH',
  'Kolkata':   'IN-WB',
  'Ahmedabad': 'IN-GJ',
};

const CITIES = Object.keys(CITY_CODE_MAP);

// Approximate coordinates for nearest-city GPS resolution
const CITY_COORDS = [
  { name: 'Mumbai',    lat: 19.076, lng: 72.877 },
  { name: 'Delhi',     lat: 28.704, lng: 77.102 },
  { name: 'Bangalore', lat: 12.972, lng: 77.594 },
  { name: 'Hyderabad', lat: 17.385, lng: 78.487 },
  { name: 'Chennai',   lat: 13.083, lng: 80.270 },
  { name: 'Pune',      lat: 18.520, lng: 73.857 },
  { name: 'Kolkata',   lat: 22.572, lng: 88.363 },
  { name: 'Ahmedabad', lat: 23.023, lng: 72.571 },
];

function nearestCity(lat, lng) {
  let best = CITY_COORDS[0].name;
  let bestDist = Infinity;
  CITY_COORDS.forEach(({ name, lat: clat, lng: clng }) => {
    const d = (clat - lat) ** 2 + (clng - lng) ** 2;
    if (d < bestDist) { bestDist = d; best = name; }
  });
  return best;
}

export default function TransactionSimulator({ onResult }) {
  const [merchant, setMerchant]       = useState(MERCHANTS[0]);
  const [amount, setAmount]           = useState('');
  const [city, setCity]               = useState('Mumbai');
  const [gpsLoading, setGpsLoading]   = useState(false);
  const [gpsCityName, setGpsCityName] = useState(null);
  const [loading, setLoading]         = useState(false);
  const [result, setResult]           = useState(null);
  const [clawbackDone, setClawbackDone] = useState(false);

  const detectGPS = () => {
    if (!navigator.geolocation) return;
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const found = nearestCity(coords.latitude, coords.longitude);
        setCity(found);
        setGpsCityName(found);
        setGpsLoading(false);
      },
      () => setGpsLoading(false),
      { timeout: 6000 }
    );
  };

  const handleSimulate = async () => {
    if (!amount || isNaN(amount)) return;
    setLoading(true);
    setResult(null);
    setClawbackDone(false);

    const locationCode = CITY_CODE_MAP[city] || city;

    try {
      const walletId = localStorage.getItem(DEMO_WALLET_STORAGE_KEY) || 'demo-wallet-id';
      const data = await simulateTransaction({
        wallet_id: walletId,
        amount: parseFloat(amount),
        category: merchant.category,
        merchant: merchant.name,
        location: locationCode,
        metadata: { channel: 'simulator', demo: true },
      });
      setResult(data);
      onResult && onResult(data);
    } catch {
      const isGambling = merchant.category === 'gambling';
      const demo = {
        transaction_id: `demo-${Date.now()}`,
        status: isGambling ? 'BLOCKED' : 'APPROVED',
        reason: isGambling
          ? 'Category gambling is blocked by policy'
          : 'Transaction complies with all active policies',
        policies_evaluated: 3,
        processing_time_ms: 42,
        ai_reasoning: isGambling
          ? 'Gambling transactions are restricted by your safety rule.'
          : `₹${amount} at ${merchant.name} (${locationCode}) approved within category limits.`,
        confidence: 0.96,
      };
      setResult(demo);
      onResult && onResult(demo);
    } finally {
      setLoading(false);
    }
  };

  const handleClawback = async () => {
    if (!result?.transaction_id) return;
    try {
      await executeClawback({
        transaction_id: result.transaction_id,
        reason: 'Manual clawback initiated via simulator',
      });
    } catch { /* demo: proceed optimistically */ }
    setClawbackDone(true);
    setResult(r => ({ ...r, status: 'CLAWBACK_REQUIRED' }));
  };

  const decisionMeta = result ? getDecisionMeta(result.status) : null;
  const { Icon: StatusIcon, class: statusClass } = result
    ? STATUS_ICON[result.status] || STATUS_ICON.APPROVED
    : { Icon: Play, class: '' };

  return (
    <GlassCard hover={false}>
      <h3 className="font-display font-semibold text-lg text-slate-100 mb-5">
        Transaction Simulator
      </h3>

      <div className="space-y-4">
        {/* Merchant selector */}
        <div>
          <label className="font-body text-xs text-slate-400 uppercase tracking-wider mb-2 block">
            Merchant
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {MERCHANTS.slice(0, 6).map((m) => (
              <motion.button
                key={m.name}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setMerchant(m)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-body transition-all duration-200"
                style={{
                  background: merchant.name === m.name
                    ? 'rgba(167,139,250,0.12)'
                    : 'rgba(255,255,255,0.03)',
                  border: merchant.name === m.name
                    ? '1px solid rgba(167,139,250,0.35)'
                    : '1px solid rgba(255,255,255,0.06)',
                  color: merchant.name === m.name ? '#A78BFA' : '#94A3B8',
                }}
              >
                <span>{m.avatar}</span>
                <span className="truncate">{m.name}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Amount + Location */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="font-body text-xs text-slate-400 uppercase tracking-wider mb-2 block">
              Amount (₹)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-100 font-mono text-sm placeholder-slate-500 outline-none focus:border-trust-electric/50 transition-colors"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-body text-xs text-slate-400 uppercase tracking-wider">
                Location
              </label>
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={detectGPS}
                disabled={gpsLoading}
                title="Auto-detect via GPS"
                className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-mono font-semibold"
                style={{
                  background: gpsCityName ? 'rgba(52,211,153,0.12)' : 'rgba(167,139,250,0.1)',
                  border: gpsCityName
                    ? '1px solid rgba(52,211,153,0.3)'
                    : '1px solid rgba(167,139,250,0.2)',
                  color: gpsCityName ? '#34D399' : '#A78BFA',
                }}
              >
                {gpsLoading
                  ? <Loader size={10} className="animate-spin" />
                  : gpsCityName
                  ? <><Navigation size={10} /> {gpsCityName}</>
                  : <><MapPin size={10} /> GPS</>
                }
              </motion.button>
            </div>
            <select
              value={city}
              onChange={(e) => { setCity(e.target.value); setGpsCityName(null); }}
              className="w-full px-4 py-2.5 rounded-xl border text-slate-100 font-body text-sm outline-none focus:border-trust-electric/50 transition-colors"
              style={{ background: 'rgba(14,19,42,0.85)', borderColor: 'rgba(255,255,255,0.1)' }}
            >
              {CITIES.map(c => (
                <option key={c} value={c} style={{ background: '#0E132A' }}>{c}</option>
              ))}
            </select>
            <p className="font-mono text-[10px] text-slate-600 mt-1">
              {CITY_CODE_MAP[city]}
            </p>
          </div>
        </div>

        {/* Category badge */}
        <div className="flex items-center gap-2">
          <span className="font-body text-xs text-slate-500">Category:</span>
          <span
            className="font-mono text-xs px-2.5 py-1 rounded-full"
            style={{
              background: 'rgba(167,139,250,0.08)',
              color: '#A78BFA',
              border: '1px solid rgba(167,139,250,0.2)',
            }}
          >
            {merchant.category}
          </span>
        </div>

        {/* Simulate button */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSimulate}
          disabled={loading || !amount}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-display font-semibold text-white transition-all disabled:opacity-40"
          style={{ background: 'linear-gradient(135deg, #7C3AED, #C026D3)' }}
        >
          {loading
            ? <><Loader size={16} className="animate-spin" />Validating…</>
            : <><Play size={16} />Simulate Transaction</>
          }
        </motion.button>

        {/* Result */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-2xl p-4 border"
              style={{
                background: decisionMeta?.bg || 'rgba(255,255,255,0.04)',
                borderColor: decisionMeta?.color ? `${decisionMeta.color}40` : 'rgba(255,255,255,0.1)',
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <StatusIcon size={22} className={statusClass} />
                <span className="font-display font-bold text-lg" style={{ color: decisionMeta?.color }}>
                  {clawbackDone ? 'Clawback Initiated' : result.status}
                </span>
                {result.processing_time_ms != null && (
                  <span className="ml-auto font-mono text-xs text-slate-400">
                    {Number(result.processing_time_ms).toFixed(1)}ms
                  </span>
                )}
              </div>

              {result.reason && (
                <p className="font-body text-sm text-slate-300 mb-2">{result.reason}</p>
              )}
              {result.ai_reasoning && (
                <p className="font-body text-xs text-slate-400 italic leading-relaxed">
                  {result.ai_reasoning}
                </p>
              )}
              {result.policies_evaluated > 0 && (
                <p className="font-mono text-xs text-slate-500 mt-2">
                  {result.policies_evaluated} policies evaluated
                </p>
              )}

              {result.status === 'APPROVED' && !clawbackDone && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleClawback}
                  className="mt-3 w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-body font-semibold"
                  style={{
                    background: 'rgba(251,146,60,0.1)',
                    border: '1px solid rgba(251,146,60,0.3)',
                    color: '#FB923C',
                  }}
                >
                  <RotateCcw size={14} />
                  Initiate Clawback
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </GlassCard>
  );
}
