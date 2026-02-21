/* ─── API Configuration ──────────────────────────────────────────── */

export const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api/v1';

export const BLOCKCHAIN_API_URL =
  process.env.REACT_APP_BLOCKCHAIN_API_URL || 'http://localhost:3001/api/v1/blockchain';

export const REQUEST_TIMEOUT = 8000; // 8 seconds

/** Storage key for persisting the demo wallet ID across sessions */
export const DEMO_WALLET_STORAGE_KEY = 'intentforge_demo_wallet_id';

/** Fixed owner ID used in demo flows */
export const DEMO_OWNER_ID = 'demo_user_nxtgen_2025';

export const DECISION_STATES = {
  APPROVED: 'APPROVED',
  BLOCKED: 'BLOCKED',
  VIOLATION: 'VIOLATION',
  CLAWBACK_REQUIRED: 'CLAWBACK_REQUIRED',
};
