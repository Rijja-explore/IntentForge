/* ─── Wallet Service ──────────────────────────────────────────────── */

import api from './api';
import {
  DEMO_OWNER_ID,
  DEMO_WALLET_STORAGE_KEY,
} from '../config/api';

/* ── Demo fallback data ──────────────────────────────────────────── */
const DEMO_WALLET = {
  wallet_id: null,   // null = backend not reachable; never send to API
  owner_id: DEMO_OWNER_ID,
  balance: 50000.0,
  currency: 'INR',
  is_locked: false,
  compliance_score: 0.87,
  attached_policies: [],
};

/* ── UUID format guard ───────────────────────────────────────────── */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Retrieve or create the demo wallet; caches ID in localStorage */
export async function getOrCreateDemoWallet() {
  const cached = localStorage.getItem(DEMO_WALLET_STORAGE_KEY);

  // Evict any stale / non-UUID value (e.g. "demo-wallet-..." from old sessions)
  if (cached && !UUID_RE.test(cached)) {
    localStorage.removeItem(DEMO_WALLET_STORAGE_KEY);
  } else if (cached) {
    try {
      return await getWallet(cached);
    } catch {
      // Wallet dropped on server restart — create a fresh one
      localStorage.removeItem(DEMO_WALLET_STORAGE_KEY);
    }
  }

  try {
    const wallet = await api.post('/wallet/create', {
      owner_id: DEMO_OWNER_ID,
      currency: 'INR',
      initial_balance: 50000.0,
    });
    if (wallet?.wallet_id) {
      localStorage.setItem(DEMO_WALLET_STORAGE_KEY, wallet.wallet_id);
    }
    return wallet;
  } catch {
    return DEMO_WALLET;
  }
}

export async function createWallet(payload) {
  try {
    return await api.post('/wallet/create', payload);
  } catch {
    return { ...DEMO_WALLET, owner_id: payload.owner_id };
  }
}

export async function getWallet(walletId) {
  if (!walletId) return DEMO_WALLET;
  // Let errors propagate so callers (e.g. getOrCreateDemoWallet) can clear stale cache
  return await api.get(`/wallet/${walletId}`);
}

export async function getWalletBalance(walletId) {
  if (!walletId) return { wallet_id: null, balance: DEMO_WALLET.balance, currency: 'INR', is_locked: false };
  try {
    return await api.get(`/wallet/${walletId}/balance`);
  } catch {
    return {
      wallet_id: walletId,
      balance: DEMO_WALLET.balance,
      currency: 'INR',
      is_locked: false,
    };
  }
}

export async function listWallets(ownerId) {
  try {
    const params = ownerId ? { owner_id: ownerId } : {};
    return await api.get('/wallet/', { params });
  } catch {
    return [DEMO_WALLET];
  }
}

