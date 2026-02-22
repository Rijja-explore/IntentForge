/* ─── roles.js ─────────────────────────────────────────────────────
 * Centralised role config.
 * Source-of-truth addresses are kept in contracts.js (auto-generated
 * by the deploy script).  This file re-exports them alongside any
 * role-level metadata so the rest of the app imports from one place.
 * ─────────────────────────────────────────────────────────────── */

export { LENDER_ADDRESS, RECEIVER_ADDRESS } from './contracts';

export const ROLES = {
  LENDER:       'lender',
  RECEIVER:     'receiver',
  UNAUTHORIZED: 'unknown',
};
