/* ─── Policy Service ──────────────────────────────────────────────── */

import api from './api';

/**
 * Normalise a flat or pre-nested payload into the shape the backend expects:
 * { name, policy_type, rules: { allowed_categories, max_amount, ... }, wallet_id?, priority? }
 *
 * Callers may pass either:
 *   (a) already-nested: { name, policy_type, rules: {...}, ... }   ← from AI parse-intent
 *   (b) flat fields:    { name, policy_type, allowed_categories, max_amount, ... }  ← from UI
 */
function normalisePolicy(payload) {
  if (payload.rules && typeof payload.rules === 'object') {
    return payload; // already nested — pass through
  }
  const {
    name,
    policy_type,
    wallet_id,
    priority,
    description,
    allowed_categories,
    max_amount,
    per_transaction_cap,
    geo_fence,
    expiry_days,
    merchant_whitelist,
    merchant_blacklist,
  } = payload;

  const rules = {};
  if (allowed_categories?.length)   rules.allowed_categories   = allowed_categories;
  if (max_amount != null)            rules.max_amount           = max_amount;
  if (per_transaction_cap != null)   rules.per_transaction_cap  = per_transaction_cap;
  if (geo_fence?.length)             rules.geo_fence            = geo_fence;
  if (merchant_whitelist?.length)    rules.merchant_whitelist   = merchant_whitelist;
  if (merchant_blacklist?.length)    rules.merchant_blacklist   = merchant_blacklist;

  // Convert expiry_days → ISO datetime
  if (expiry_days) {
    const d = new Date();
    d.setDate(d.getDate() + Number(expiry_days));
    rules.expiry = d.toISOString();
  }

  return { name, policy_type, rules, description, wallet_id, priority };
}

export async function createPolicy(payload) {
  return api.post('/policy/create', normalisePolicy(payload));
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

