export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatAmount(amount) {
  return '₹' + amount.toLocaleString('en-IN');
}

/** 1 ETH = ₹2,50,000 (display conversion — all on-chain values settle in ETH) */
export const ETH_TO_INR = 250000;

/** Converts an ETH amount (string or number) to a ₹ formatted string e.g. "₹25,000" */
export function formatEthAsInr(ethAmount) {
  const eth = parseFloat(ethAmount) || 0;
  return '₹' + Math.round(eth * ETH_TO_INR).toLocaleString('en-IN');
}

export function formatDate(date) {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function formatRelativeTime(date) {
  const now = new Date();
  const diff = now - new Date(date);
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return formatDate(date);
}

export function formatTrustScore(score) {
  if (score >= 90) return { label: 'Excellent', color: 'text-success-emerald' };
  if (score >= 70) return { label: 'Good', color: 'text-trust-electric' };
  if (score >= 50) return { label: 'Fair', color: 'text-warning-amber' };
  return { label: 'At Risk', color: 'text-danger-crimson' };
}
