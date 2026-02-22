/* ─── useWallet Hook ─────────────────────────────────────────────── */

import { useState, useEffect, useCallback } from 'react';
import { getOrCreateDemoWallet, getWallet } from '../services/walletService';
import { DEMO_WALLET_STORAGE_KEY } from '../config/api';

const DEMO_FALLBACK = {
  wallet_id: null,
  owner_id: 'demo_user',
  balance: 50000.0,
  currency: 'INR',
  is_locked: false,
  compliance_score: 0.87,
  attached_policies: [],
};

export function useWallet() {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWallet = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getOrCreateDemoWallet();
      setWallet(data);
    } catch (err) {
      setError(err.message);
      setWallet(DEMO_FALLBACK);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  const refreshWallet = useCallback(async () => {
    const walletId = localStorage.getItem(DEMO_WALLET_STORAGE_KEY);
    if (!walletId) return fetchWallet();
    setLoading(true);
    try {
      const data = await getWallet(walletId);
      setWallet(data);
    } catch {
      // Keep stale data on refresh failure
    } finally {
      setLoading(false);
    }
  }, [fetchWallet]);

  return { wallet, loading, error, refreshWallet };
}
