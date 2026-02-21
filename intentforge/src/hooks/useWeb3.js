/* ─── useWeb3 Hook ───────────────────────────────────────────────────
 * Manages MetaMask connection state and role detection.
 *
 * Role logic:
 *   account === LENDER_ADDRESS   → role = 'lender'
 *   account === RECEIVER_ADDRESS → role = 'receiver'
 *   otherwise                    → role = 'unknown'
 *
 * The hook listens to accountsChanged / chainChanged so the UI updates
 * automatically when the user switches accounts in MetaMask.
 * ─────────────────────────────────────────────────────────────── */

import { useState, useEffect, useCallback } from 'react';
import {
  getCurrentAccount,
  connectWallet,
  detectRole,
  getEthBalance,
  getLockedBalance,
  ensureCorrectNetwork,
  subscribeToEvents,
} from '../services/contractService';
import { INTENT_FORGE_ADDRESS } from '../config/contracts';

export function useWeb3() {
  const [account,       setAccount]       = useState(null);   // e.g. "0xf39f..."
  const [role,          setRole]          = useState('unknown'); // 'lender' | 'receiver' | 'unknown'
  const [ethBalance,    setEthBalance]    = useState('0.0');
  const [lockedBalance, setLockedBalance] = useState('0.0');
  const [connecting,    setConnecting]    = useState(false);
  const [error,         setError]         = useState(null);
  const [isContractDeployed, setIsContractDeployed] = useState(false);

  // ── Refresh balances ────────────────────────────────────────────
  const refreshBalances = useCallback(async (addr) => {
    if (!addr) return;
    const [eth, locked] = await Promise.all([
      getEthBalance(addr),
      getLockedBalance(),
    ]);
    setEthBalance(eth);
    setLockedBalance(locked);
  }, []);

  // ── Check contract deployment ───────────────────────────────────
  const checkContract = useCallback(async () => {
    const deployed = INTENT_FORGE_ADDRESS !== '0x0000000000000000000000000000000000000000';
    setIsContractDeployed(deployed);
  }, []);

  // ── Update account state ────────────────────────────────────────
  const updateAccount = useCallback(async (addr) => {
    const normalized = addr?.toLowerCase() ?? null;
    setAccount(normalized);
    setRole(detectRole(normalized));
    setError(null);
    if (normalized) await refreshBalances(normalized);
  }, [refreshBalances]);

  // ── Connect wallet ──────────────────────────────────────────────
  const connect = useCallback(async () => {
    setConnecting(true);
    setError(null);
    try {
      await ensureCorrectNetwork();
      const addr = await connectWallet();
      await updateAccount(addr);
    } catch (err) {
      setError(err.message || 'Failed to connect wallet');
    } finally {
      setConnecting(false);
    }
  }, [updateAccount]);

  // ── Disconnect (local state only — MetaMask doesn't allow forced disconnect) ──
  const disconnect = useCallback(() => {
    setAccount(null);
    setRole('unknown');
    setEthBalance('0.0');
  }, []);

  // ── On mount: check if already connected ───────────────────────
  useEffect(() => {
    checkContract();

    getCurrentAccount().then((addr) => {
      if (addr) updateAccount(addr);
    });
  }, [checkContract, updateAccount]);

  // ── MetaMask event listeners ────────────────────────────────────
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts) => {
      const addr = accounts[0] ?? null;
      updateAccount(addr);
    };

    const handleChainChanged = () => {
      // Reload to avoid state inconsistencies after network switch
      window.location.reload();
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged',    handleChainChanged);

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged',    handleChainChanged);
    };
  }, [updateAccount]);

  // ── Real-time contract events ───────────────────────────────────
  useEffect(() => {
    if (!account || !isContractDeployed) return;

    const unsubscribe = subscribeToEvents(
      () => refreshBalances(account),  // IntentCreated
      () => refreshBalances(account),  // IntentClaimed
    );

    return unsubscribe;
  }, [account, isContractDeployed, refreshBalances]);

  return {
    account,
    role,                    // 'lender' | 'receiver' | 'unknown'
    isLender:   role === 'lender',
    isReceiver: role === 'receiver',
    ethBalance,
    lockedBalance,
    connecting,
    error,
    isContractDeployed,
    connect,
    disconnect,
    refreshBalances: () => refreshBalances(account),
  };
}
