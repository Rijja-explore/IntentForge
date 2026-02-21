/* ─── AI Service ──────────────────────────────────────────────────── */

import api from './api';

/**
 * Parse a natural language intent into a structured policy.
 *
 * Payload: { user_input: string, wallet_id?: string }
 *
 * Returns:
 *   { policy: {...}, confidence: 0.92, extracted_components: {...}, requires_review: false }
 */
export async function parseIntent(userInput, walletId) {
  const payload = { user_input: userInput };
  if (walletId) payload.wallet_id = walletId;
  return api.post('/ai/parse-intent', payload);
}

export async function getSupportedCategories() {
  return api.get('/ai/supported-categories');
}

export async function getAISuggestions(walletId) {
  return api.get(`/ai/suggestions/${walletId}`);
}

/** Quick health check for the AI service. */
export async function checkAIHealth() {
  return api.get('/ai/health');
}
