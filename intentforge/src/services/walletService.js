/* ─── Wallet Service ──────────────────────────────────────────────── */

import api from './api';
import {
  DEMO_OWNER_ID,
  DEMO_WALLET_STORAGE_KEY,
} from '../config/api';

/* ── Demo fallback data ──────────────────────────────────────────── */
const DEMO_WALLET = {
  wallet_id: 'demo-wallet-00000000-0000-0000-0000-000000000001',
  owner_id: DEMO_OWNER_ID,
  balance: 50000.0,
  currency: 'INR',
  is_locked: false,
  compliance_score: 0.87,
  attached_policies: [],
};

/** Retrieve or create the demo wallet; caches ID in localStorage */
export async function getOrCreateDemoWallet() {
  const cached = localStorage.getItem(DEMO_WALLET_STORAGE_KEY);
  if (cached) {
    try {
      return await getWallet(cached);
    } catch {
      // Wallet may have been dropped (server restart) — create a fresh one
      localStorage.removeItem(DEMO_WALLET_STORAGE_KEY);
    }
  }

  const wallet = await createWallet({
    owner_id: DEMO_OWNER_ID,
    currency: 'INR',
    initial_balance: 50000.0,
  });
  localStorage.setItem(DEMO_WALLET_STORAGE_KEY, wallet.wallet_id);
  return wallet;
}

export async function createWallet(payload) {
  try {
    return await api.post('/wallet/create', payload);
  } catch {
    return { ...DEMO_WALLET, owner_id: payload.owner_id };
  }
}

export async function getWallet(walletId) {
  try {
    return await api.get(`/wallet/${walletId}`);
  } catch {
    return DEMO_WALLET;
  }
}

export async function getWalletBalance(walletId) {
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
