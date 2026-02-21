/* ─── Policy Service ──────────────────────────────────────────────── */

import api from './api';

/**
 * Create a new policy/intent.
 *
 * Required payload fields:
 *   name, policy_type, allowed_categories[], max_amount,
 *   per_transaction_cap, geo_fence[], expiry_days, wallet_id (optional)
 */
export async function createPolicy(payload) {
  return api.post('/policy/create', payload);
}

export async function getPolicy(policyId) {
  return api.get(`/policy/${policyId}`);
}

export async function updatePolicy(policyId, updates) {
  return api.put(`/policy/${policyId}/update`, updates);
}

export async function deletePolicy(policyId) {
  return api.delete(`/policy/${policyId}`);
}

export async function getWalletPolicies(walletId) {
  return api.get(`/policy/wallet/${walletId}`);
}

export async function attachPolicyToWallet(walletId, policyId) {
  return api.post(`/wallet/${walletId}/attach-policy`, { policy_id: policyId });
}

/**
 * Convenience helper — creates a policy and immediately attaches it to a wallet.
 * Returns the created policy.
 */
export async function createAndAttachPolicy(walletId, payload) {
  const policy = await createPolicy({ ...payload, wallet_id: walletId });
  if (walletId && policy?.policy_id) {
    try {
      await attachPolicyToWallet(walletId, policy.policy_id);
    } catch {
      // Non-critical — policy was created successfully
    }
  }
  return policy;
}
