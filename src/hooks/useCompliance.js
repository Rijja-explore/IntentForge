/* ─── useCompliance Hook ─────────────────────────────────────────── */

import { useState, useEffect, useCallback } from 'react';
import { getComplianceMetrics } from '../services/metricsService';

const DEMO_FALLBACK = {
  compliance_score: 0.87,
  risk_level: 'low',
  risk_score: 0.18,
  transaction_count: 24,
  anomalies: [],
  behavioral_insights: {
    primary_categories: ['food', 'transport', 'shopping'],
    avg_transaction_amount: 1240,
    approval_rate: 0.95,
  },
  computed_at: new Date().toISOString(),
};

export function useCompliance(walletId) {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMetrics = useCallback(async () => {
    if (!walletId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getComplianceMetrics(walletId);
      setMetrics(data);
    } catch (err) {
      setError(err.message);
      setMetrics(DEMO_FALLBACK);
    } finally {
      setLoading(false);
    }
  }, [walletId]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return { metrics, loading, error, refetch: fetchMetrics };
}
