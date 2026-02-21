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
 * Simulate a transaction (identical to validate — /transaction/simulate
 * is not a separate endpoint, so we reuse /transaction/validate).
 */
export async function simulateTransaction(payload) {
  return api.post('/transaction/validate', payload);
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

/**
 * Fetch all blocked/violation transactions for a wallet that have not yet
 * been clawedback. Returns an array of transaction objects.
 */
export async function getViolations(walletId) {
  try {
    const history = await getTransactionHistory(walletId);
    const txns = Array.isArray(history) ? history : (history?.transactions ?? []);
    return txns.filter(
      (t) => (t.status === 'BLOCKED' || t.status === 'VIOLATION') && !t.clawback_executed
    );
  } catch {
    return [];
  }
}

/**
 * Auto-clawback all pending violations for a wallet.
 * Returns { secured: number } — count of clawbacks successfully initiated.
 */
export async function autoClawback(walletId) {
  const violations = await getViolations(walletId);
  let secured = 0;
  for (const txn of violations) {
    try {
      await executeClawback({
        transaction_id: txn.id || txn.transaction_id,
        reason: 'AUTO_CLAWBACK: policy violation detected by Auto-Protect',
      });
      secured++;
    } catch {
      /* skip individual failures — continue processing remaining */
    }
  }
  return { secured };
}
