/* ─── Transaction Service ─────────────────────────────────────────── */

import api from './api';
import { DECISION_STATES } from '../config/api';

/**
 * Validate a transaction against wallet policies.
 *
 * Payload:
 *   wallet_id, amount, category, merchant, location (optional), metadata (optional)
 *
 * Returns ValidationResult:
 *   { transaction_id, status: 'APPROVED'|'BLOCKED', reason, policies_evaluated,
 *     processing_time_ms, ai_reasoning, confidence }
 */
export async function validateTransaction(payload) {
  return api.post('/transaction/validate', payload);
}

/**
 * Simulate a transaction (identical to validate — no persistence emphasis).
 */
export async function simulateTransaction(payload) {
  return api.post('/transaction/simulate', payload);
}

export async function getTransaction(txId) {
  return api.get(`/transaction/${txId}`);
}

export async function getTransactionHistory(walletId) {
  return api.get(`/transaction/wallet/${walletId}/history`);
}

/**
 * Execute a clawback on a previously approved transaction.
 *
 * Payload: { transaction_id, reason }
 */
export async function executeClawback(payload) {
  return api.post('/clawback/execute', payload);
}

/** Map backend status string to display label + color. */
export function getDecisionMeta(status) {
  switch (status) {
    case DECISION_STATES.APPROVED:
      return { label: 'Approved', color: '#34D399', bg: 'rgba(52,211,153,0.12)' };
    case DECISION_STATES.BLOCKED:
      return { label: 'Blocked', color: '#F87171', bg: 'rgba(248,113,113,0.12)' };
    case DECISION_STATES.VIOLATION:
      return { label: 'Violation', color: '#FCD34D', bg: 'rgba(252,211,77,0.12)' };
    case DECISION_STATES.CLAWBACK_REQUIRED:
      return { label: 'Clawback', color: '#FB923C', bg: 'rgba(251,146,60,0.12)' };
    default:
      return { label: status || 'Pending', color: '#94A3B8', bg: 'rgba(148,163,184,0.1)' };
  }
}
