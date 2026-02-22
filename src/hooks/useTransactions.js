/* ─── useTransactions Hook ───────────────────────────────────────── */

import { useState, useEffect, useCallback } from 'react';
import { getTransactionHistory, validateTransaction } from '../services/transactionService';
import { DEMO_TRANSACTIONS } from '../utils/constants';

export function useTransactions(walletId) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchHistory = useCallback(async () => {
    if (!walletId) {
      setTransactions(DEMO_TRANSACTIONS);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getTransactionHistory(walletId);
      setTransactions(Array.isArray(data) ? data : DEMO_TRANSACTIONS);
    } catch (err) {
      setError(err.message);
      setTransactions(DEMO_TRANSACTIONS);
    } finally {
      setLoading(false);
    }
  }, [walletId]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  /**
   * Validate a new transaction and prepend the result to the feed.
   * Returns the ValidationResult from the backend.
   */
  const validate = useCallback(async (payload) => {
    const result = await validateTransaction(payload);
    // Prepend to local feed for instant UI feedback
    setTransactions((prev) => [
      {
        id: result.transaction_id || Date.now(),
        merchant: payload.merchant,
        amount: payload.amount,
        category: payload.category,
        status: result.status?.toLowerCase() || 'pending',
        timestamp: new Date(),
        reason: result.reason,
        ai_reasoning: result.ai_reasoning,
      },
      ...prev.slice(0, 49),
    ]);
    return result;
  }, []);

  return { transactions, loading, error, validate, refresh: fetchHistory };
}
