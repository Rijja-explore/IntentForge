/* ─── Metrics Service ─────────────────────────────────────────────── */

import api from './api';

/**
 * Get compliance and risk metrics for a wallet.
 *
 * Returns:
 *   { compliance_score, risk_level, risk_score, anomalies, transaction_count,
 *     behavioral_insights, computed_at }
 */
export async function getComplianceMetrics(walletId) {
  return api.get('/metrics/compliance', { params: { wallet_id: walletId } });
}

export async function getRiskAnalysis(walletId) {
  return api.get(`/metrics/wallet/${walletId}/risk-analysis`);
}

export async function getBlockchainAuditLog(limit = 50, eventType) {
  const params = { limit };
  if (eventType) params.event_type = eventType;
  return api.get('/metrics/blockchain/audit-log', { params });
}

/**
 * Run a stress test on the validation pipeline.
 * Params: { wallet_id, num_transactions?, concurrent? }
 */
export async function runStressTest(walletId, numTransactions = 50, concurrent = false) {
  return api.post('/metrics/stress-test', null, {
    params: {
      wallet_id: walletId,
      num_transactions: numTransactions,
      concurrent,
    },
  });
}
