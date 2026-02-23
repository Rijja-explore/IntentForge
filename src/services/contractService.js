/* ─── Contract Service ──────────────────────────────────────────────
 * Ethers.js v6 bridge between the React UI and IntentForge.sol.
 * All on-chain calls go through this service.
 * The frontend has ZERO enforcement logic — contract handles it all.
 * ─────────────────────────────────────────────────────────────── */

import { ethers } from 'ethers';
import {
  INTENT_FORGE_ADDRESS,
  INTENT_FORGE_ABI,
  LENDER_ADDRESS,
  RECEIVER_ADDRESS,
  CHAIN_ID,
} from '../config/contracts';

// ─── Error Sanitization ───────────────────────────────────────────

/**
 * Strips sensitive data from error messages before surfacing to the UI.
 * - Redacts 32-byte hex strings (private key pattern)
 * - Redacts RPC URL with credentials
 * - Maps MetaMask rejection codes to friendly messages
 */
function sanitizeError(err) {
  if (err?.code === 4001)   return 'Connection rejected — please approve the request in MetaMask.';
  if (err?.code === -32002) return 'MetaMask request already pending — please open the extension.';
  if (err?.code === -32603) return 'Internal MetaMask error. Make sure Hardhat node is running.';

  const raw = err?.reason || err?.shortMessage || err?.message || 'Transaction failed.';

  const cleaned = raw
    // Redact private keys (0x + 64 hex chars)
    .replace(/0x[0-9a-fA-F]{64}/g, '[redacted]')
    // Redact any http/https URL that might carry credentials or internal paths
    .replace(/https?:\/\/[^\s"')>]+/g, '[rpc-url]')
    // Redact JSON-RPC internals that leak stack traces
    .replace(/\(action="[^"]*",\s*data=[^)]*\)/g, '')
    .trim();

  return cleaned.length > 200 ? cleaned.slice(0, 200) + '…' : cleaned || 'Transaction failed.';
}

// ─── Provider / Signer helpers ────────────────────────────────────

/** Returns a read-only provider connected to the Hardhat node. */
export function getReadProvider() {
  if (typeof window !== 'undefined' && window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum);
  }
  return new ethers.JsonRpcProvider('http://127.0.0.1:8545');
}

/** Requests wallet connection and returns a signer. */
export async function getSigner() {
  if (!window.ethereum) {
    throw new Error('MetaMask not found. Please install MetaMask.');
  }
  const provider = new ethers.BrowserProvider(window.ethereum);
  await provider.send('eth_requestAccounts', []);
  return provider.getSigner();
}

/** Returns the currently connected account address (lowercase). */
export async function getCurrentAccount() {
  if (!window.ethereum) return null;
  const accounts = await window.ethereum.request({ method: 'eth_accounts' });
  return accounts[0]?.toLowerCase() ?? null;
}

/** Prompts MetaMask to connect and returns the selected account. */
export async function connectWallet() {
  if (!window.ethereum) {
    throw new Error('MetaMask not found. Please install MetaMask.');
  }
  try {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    return accounts[0]?.toLowerCase() ?? null;
  } catch (err) {
    throw new Error(sanitizeError(err));
  }
}

/** Switch MetaMask to the Hardhat local network (chain 31337). */
export async function ensureCorrectNetwork() {
  if (!window.ethereum) return;
  const chainIdHex = '0x' + CHAIN_ID.toString(16);
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: chainIdHex }],
    });
  } catch (switchError) {
    // Chain not yet added to MetaMask — add it
    if (switchError.code === 4902) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: chainIdHex,
          chainName: 'Hardhat Local',
          rpcUrls: ['http://127.0.0.1:8545'],
          nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
        }],
      });
    }
  }
}

// ─── Role Detection ──────────────────────────────────────────────

/** Returns 'lender' | 'receiver' | 'unknown' */
export function detectRole(account) {
  if (!account) return 'unknown';
  const addr = account.toLowerCase();
  if (addr === LENDER_ADDRESS.toLowerCase())   return 'lender';
  if (addr === RECEIVER_ADDRESS.toLowerCase()) return 'receiver';
  return 'unknown';
}

// ─── ETH Balance ─────────────────────────────────────────────────

/** Returns native ETH balance as a formatted string (e.g. "9.99"). */
export async function getEthBalance(address) {
  if (!address) return '0.0';
  try {
    const provider = getReadProvider();
    const bal = await provider.getBalance(address);
    return parseFloat(ethers.formatEther(bal)).toFixed(4);
  } catch {
    return '0.0';
  }
}

// ─── Contract Instance ────────────────────────────────────────────

function getContractReadOnly() {
  const provider = getReadProvider();
  return new ethers.Contract(INTENT_FORGE_ADDRESS, INTENT_FORGE_ABI, provider);
}

async function getContractWithSigner() {
  const signer = await getSigner();
  return new ethers.Contract(INTENT_FORGE_ADDRESS, INTENT_FORGE_ABI, signer);
}

// ─── LENDER: Create Intent ────────────────────────────────────────

/**
 * Lock ETH into the contract with an expiry restriction.
 * @param {string} receiverAddress - The receiver's wallet address.
 * @param {number} expirySeconds   - Duration in seconds from now.
 * @param {string} ethAmount       - Amount of ETH to lock (e.g. "0.01").
 * @returns {{ ruleId: string, txHash: string }}
 */
export async function createIntent(receiverAddress, expirySeconds, ethAmount) {
  await ensureCorrectNetwork();
  const contract = await getContractWithSigner();

  const expiry  = Math.floor(Date.now() / 1000) + Number(expirySeconds);
  const value   = ethers.parseEther(String(ethAmount));

  try {
    const tx = await contract.createIntent(receiverAddress, expiry, { value });
    const receipt = await tx.wait();

    // Extract ruleId from IntentCreated event log
    const iface  = new ethers.Interface(INTENT_FORGE_ABI);
    let ruleId = null;
    for (const log of receipt.logs) {
      try {
        const parsed = iface.parseLog({ topics: [...log.topics], data: log.data });
        if (parsed?.name === 'IntentCreated') {
          // args[0] is ruleId (bytes32 → hex string); convert explicitly to string
          const raw = parsed.args[0] ?? parsed.args.ruleId;
          ruleId = raw != null ? String(raw) : null;
          break;
        }
      } catch { /* skip non-matching logs */ }
    }

    return { ruleId, txHash: receipt.hash };
  } catch (err) {
    throw new Error(sanitizeError(err));
  }
}

// ─── RECEIVER: Claim Intent ───────────────────────────────────────

/**
 * Claim ETH from the contract.
 * Contract will revert if: caller is not receiver, rule inactive, or expired.
 * @param {string} ruleId - bytes32 rule identifier.
 * @returns {{ txHash: string }}
 */
export async function claimIntent(ruleId) {
  await ensureCorrectNetwork();
  const contract = await getContractWithSigner();

  try {
    const tx = await contract.claimIntent(ruleId);
    const receipt = await tx.wait();
    return { txHash: receipt.hash };
  } catch (err) {
    throw new Error(sanitizeError(err));
  }
}

// ─── READ: List Rules ─────────────────────────────────────────────

/**
 * Returns enriched rule objects for the given address.
 * Includes status derived on-chain.
 */
export async function getUserRules(address) {
  if (!address) return [];
  try {
    const provider = getReadProvider();
    const code = await provider.getCode(INTENT_FORGE_ADDRESS);
    if (code === '0x') {
      throw new Error('Contract not deployed — redeploy with: cd blockchain && npx hardhat run scripts/deploy-intent.js --network localhost');
    }
    const contract = getContractReadOnly();
    const ruleIds  = await contract.getUserRules(address);

    const rules = await Promise.all(
      ruleIds.map(async (ruleId) => {
        const [sender, receiver, amount, expiry, active] = await contract.getRule(ruleId);
        const status = await contract.getRuleStatus(ruleId);

        return {
          ruleId:     String(ruleId),   // always a hex string, never BigInt/object
          sender,
          receiver,
          amount:    ethers.formatEther(amount),
          amountWei: amount.toString(),
          expiry:    Number(expiry),
          expiryDate: new Date(Number(expiry) * 1000).toLocaleString(),
          active,
          status,   // "ACTIVE" | "CLAIMED" | "EXPIRED"
        };
      })
    );

    return rules;
  } catch (err) {
    console.error('getUserRules error:', err);
    throw new Error('Could not load rules — make sure the Hardhat node is running and the contract is deployed.');
  }
}

// ─── READ: Contract ETH Balance ───────────────────────────────────

export async function getLockedBalance() {
  try {
    const contract = getContractReadOnly();
    const bal = await contract.getContractBalance();
    return ethers.formatEther(bal);
  } catch {
    return '0.0';
  }
}

// ─── READ: Rules for Receiver (via events) ───────────────────────

/**
 * Returns all rules addressed to a specific receiver.
 * Uses the same getUserRules() contract call (which the contract stores
 * for both sender AND receiver) and filters client-side.
 * Avoids queryFilter / eth_getLogs which can silently fail via MetaMask.
 */
export async function getRulesForReceiver(receiverAddress) {
  if (!receiverAddress) return [];
  try {
    const all = await getUserRules(receiverAddress);
    return all.filter((r) => r.receiver?.toLowerCase() === receiverAddress.toLowerCase());
  } catch (err) {
    console.error('getRulesForReceiver error:', err);
    throw new Error('Could not load rules — make sure the Hardhat node is running and the contract is deployed.');
  }
}

// ─── READ: On-chain Audit Data ────────────────────────────────────

/**
 * Derives an audit log and statistics entirely from on-chain events.
 * Avoids relying on the backend API for IntentCreated / IntentClaimed counts.
 */
export async function getOnChainAuditData() {
  const provider = getReadProvider();
  const contract = getContractReadOnly();

  const [createdLogs, claimedLogs] = await Promise.all([
    contract.queryFilter(contract.filters.IntentCreated()),
    contract.queryFilter(contract.filters.IntentClaimed()),
  ]);

  // Fetch block timestamps in parallel (cap at 20 block lookups)
  const uniqueBlocks = [...new Set([...createdLogs, ...claimedLogs].map(l => l.blockNumber))].slice(0, 20);
  const blockMap = {};
  await Promise.all(
    uniqueBlocks.map(async (n) => {
      try {
        const blk = await provider.getBlock(n);
        blockMap[n] = blk?.timestamp ?? Math.floor(Date.now() / 1000);
      } catch {
        blockMap[n] = Math.floor(Date.now() / 1000);
      }
    })
  );

  const fmt       = (ts) => new Date(ts * 1000).toLocaleTimeString();
  const shortHash = (h)  => `${h.slice(0, 6)}…${h.slice(-4)}`;
  const shortAddr = (a)  => `${a.slice(0, 8)}…${a.slice(-3)}`;

  const createdEvents = createdLogs.map((log) => ({
    type:      'policy',
    txId:      shortHash(log.transactionHash),
    status:    'REGISTERED',
    wallet:    shortAddr(log.args.sender),
    timestamp: fmt(blockMap[log.blockNumber] ?? Math.floor(Date.now() / 1000)),
    hash:      log.transactionHash,
  }));

  const claimedEvents = claimedLogs.map((log) => ({
    type:      'transaction',
    txId:      shortHash(log.transactionHash),
    status:    'APPROVED',
    wallet:    shortAddr(log.args.receiver),
    timestamp: fmt(blockMap[log.blockNumber] ?? Math.floor(Date.now() / 1000)),
    hash:      log.transactionHash,
  }));

  const recent_events = [...createdEvents, ...claimedEvents]
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  const statistics = {
    total_policies:            createdLogs.length,
    total_transactions_logged: createdLogs.length + claimedLogs.length,
    total_approved:            claimedLogs.length,
    total_blocked:             0,
    total_violations:          0,
    total_clawbacks:           0,
  };

  return { statistics, recent_events };
}

// ─── EVENTS: Real-time Listener ──────────────────────────────────

/**
 * Subscribe to IntentCreated & IntentClaimed events.
 * @param {function} onCreated  - cb(event)
 * @param {function} onClaimed  - cb(event)
 * @returns {function} unsubscribe
 */
export function subscribeToEvents(onCreated, onClaimed) {
  if (!window.ethereum) return () => {};
  const contract = getContractReadOnly();

  contract.on('IntentCreated', (...args) => onCreated?.(args));
  contract.on('IntentClaimed', (...args) => onClaimed?.(args));

  return () => {
    contract.removeAllListeners('IntentCreated');
    contract.removeAllListeners('IntentClaimed');
  };
}
